import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"

import {
  deleteBusinessByCategory,
  deleteBusinessImageByCategory,
  getCategoryByStatus,
  getCountry,
  insertBusinessScrap,
  updateCategoryStatus,
} from "./db.js"
import { CATEGORY_STATUS, delay, markBody1, markBody10, markBody2 } from "./util.js"

/**
 * ################################################################
 */
export default async function scrap() {
  const categories = await getCategoryByStatus(CATEGORY_STATUS.None)
  const countries = await getCountry()

  await deleteBusinessByCategory(categories)
  await deleteBusinessImageByCategory(categories)

  puppeteer.use(StealthPlugin())
  const browser = await puppeteer.launch({ headless: "new" })
  const page = await browser.newPage()

  await page.goto("https://trustanalytica.com/us/top-gyms", { waitUntil: "domcontentloaded", timeout: 50000 })

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    await page.select("select#filterCategory", category.value)

    for (let j = 0; j < countries.length; j++) {
      const country = countries[j]
      await page.select("select#filterCountry", country.value)

      markBody1(`Category: ${category.label}, Country: ${country.label} Started`)

      const btnSearch = await page.waitForSelector("button.search-top-page-filters")
      await btnSearch.click()

      await page.waitForNavigation()

      try {
        await page.waitForSelector("select#filterCategory")

        let loadMore = true
        while (loadMore) {
          try {
            const btnLoadMore = await page.waitForSelector("a.reviews-tab-content-load.catalog-tab-content-load")
            await btnLoadMore.click()
            await delay(10000)
            markBody2("Loading more")
          } catch(e) {
            loadMore = false
          }
        }
  
        let items = await page.$$eval(
          "div.sr-items.top-10-business-list > div.sr-item > div.sr-item-img > a",
          (elements) => elements.map((e) => ({ internal_link: e.getAttribute("href") }))
        )
  
        items = items.map((item) => ({
          category_id: category.id,
          category_value: category.value,
          category_label: category.label,
          country_id: country.id,
          country_value: country.value,
          country_code: country.code,
          country_label: country.label,
          internal_link: item.internal_link,
        }))
  
        await insertBusinessScrap(items)
        markBody1(`Category: ${category.label}, Country: ${country.label} Ended`)
      } catch (error) {
        await page.waitForSelector("div.notfound-404")
        await page.goBack()
      }
    }

    await updateCategoryStatus(category.id, CATEGORY_STATUS.Scrapped)
  }

  await browser.close()
}

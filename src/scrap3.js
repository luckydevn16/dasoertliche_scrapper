import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"

import { delay, markBody1, markBody2 } from "./util.js"
import { insertDasoertliche } from "./db.js"

/**
 * ################################################################
 */
export default async function scrap3() {
  puppeteer.use(StealthPlugin())
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  const site = "https://www.dastelefonbuch.de/Suche/Chirotherapie"

  await page.goto(site, { waitUntil: "networkidle2", timeout: 50000 })

  let loadingMore = true
  let loadButtonClicked = false

  while (loadingMore) {
    try {
      try {
        const loadingStatus = await page.waitForSelector(
          "div.page-load-status > div.hitlistitem.endoflist.infinite-scroll-last.infinite-scroll-error",
          { timeout: 1000 }
        )

        if (await loadingStatus.isHidden()) {
          if (!loadButtonClicked) {
            try {
              const loadBtn = await page.waitForSelector("div.loadbutton > button", { timeout: 1000 })
              await loadBtn.click()
              loadButtonClicked = true
              markBody2(`Load button clicked`)
            } catch (e) {
              markBody2(`Load button not found`)
            }
          }
          
          markBody2(`Loading more`)
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
          await delay(1000)
        }

        if (await loadingStatus.isVisible()) {
          loadingMore = false
        }
      } catch (e) {
        console.error("Error: ", e)
      }

      if (!loadingMore){
        markBody2(`Loading more ended`)
        
        markBody2(`Start scrapping`)

        await delay(1000)

        let items = await page.$$("div.entry.hitlistitem")

        for (const item of items) {
          let internal_link = await item.$eval("div.vcard > div.name > a.name", (e) => e.getAttribute("href"))
          let title = await item.$eval("div.vcard > div.name > a.name > span", (e) => e.textContent.replace(/[\n\t]/g, "")?.trim())

          let memo = ""
          if (await item.$("div.vcard > div[itemprop='address'] > address > a")) {
            memo = await item.$eval("div.vcard > div[itemprop='address'] > address > a", (e) => e?.textContent.replace(/[\n\t]/g, "")?.trim())
          }
          
          let address1 = ""
          if (await item.$("div.vcard > div[itemprop='address'] > address > a > span[itemprop='streetAddress']")) {
            address1 = await item.$eval("div.vcard > div[itemprop='address'] > address > a > span[itemprop='streetAddress']", (e) => e?.textContent?.trim())
          }

          let postal_code = ""
          if (await item.$("div.vcard > div[itemprop='address'] > address > a > span[itemprop='postalCode']")) {
            postal_code = await item.$eval("div.vcard > div[itemprop='address'] > address > a > span[itemprop='postalCode']", (e) => e?.textContent?.trim())
          }

          // let address2 = ""
          // if (await item.$("div.vcard > div[itemprop='address'] > address > a > span[itemprop='addressLocality']")) {
          //   address2 = await item.$eval("div.vcard > div[itemprop='address'] > address > a > span[itemprop='addressLocality']", (e) => e?.textContent?.trim())
          // }
          let address2 = memo
          address2 = address2.replace(`${address1},`, "")
          address2 = address2.replace(postal_code, "")
          address2 = address2.trim()
          
          let category = ""
          if (await item.$("div.vcard > div.additional > div.category")) {
            category = await item.$eval("div.vcard > div.additional > div.category", (e) => e?.textContent?.trim())
            let categoryArr = category.split("Branche: ")
            category = categoryArr[1]
          }

          await insertDasoertliche({
            site: "https://www.dastelefonbuch.de/",
            type: "",
            keyword: "Chirotherapie",
            page: 0,
  
            internal_link: internal_link,
            title: title,
            category: category,
            address1: address1,
            address2: address2,
            postal_code: postal_code,
            memo: `${postal_code} ${address2}`,
          })
        }

        markBody2(`End scrapping`)
      }
    } catch (error) {
      console.error("Unknown error: ", error)
    }
  }

  await browser.close()
}

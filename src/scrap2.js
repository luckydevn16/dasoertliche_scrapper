import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"

import { delay, markBody1, markBody2 } from "./util.js"
import { insertDasoertliche } from "./db.js"

/**
 * ################################################################
 */
export default async function scrap2() {
  puppeteer.use(StealthPlugin())
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  const site =
    "https://www.dasoertliche.de/?zvo_ok=1&buc=2249&plz=&quarter=&district=&ciid=&kw=Sport+Orthop%C3%A4die&ci=&kgs=&buab=71100098&zbuab=&form_name=search_nat"

  await page.goto(site, { waitUntil: "networkidle2", timeout: 50000 })

  let pageNo = 1
  let hasNext = true

  while (hasNext) {
    try {
      await delay(10000)

      markBody1(`Start Page : ${pageNo}`)

      let items = await page.$$("main#hitwrap > div.hit")

      for (const item of items) {
        let header = await item.$eval("h2 > a", (e) => ({
          internal_link: e.getAttribute("href"),
          title: e.textContent.replace(/[\n\t]/g, "")?.trim(),
        }))

        let category = ""
        if (await item.$("div.splitter > div.left > div.category")) {
          category = await item.$eval("div.splitter > div.left > div.category", (e) => e.textContent)
        }

        let address1 = ""
        let address2 = ""
        let postal_code = ""
        let memo = ""

        if (await item.$("div.splitter > div.left > address")) {
          const tempAddress = await item.$eval("div.splitter > div.left > address", (e) =>
            e.innerHTML.replace(/[\n\t]/g, "")?.trim()
          )
          const addressArr = tempAddress.split("<br>")
          address1 = addressArr?.[0]?.trim()
          memo = addressArr?.[1]?.trim()
          postal_code = memo.substring(0, 5)
          address2 = memo.substring(6, memo.length)
        }

        await insertDasoertliche({
          site: "https://www.dasoertliche.de",
          type: "Standardsuche",
          keyword: "Sport Orthopädie",
          page: pageNo,

          internal_link: header.internal_link,
          title: header.title,
          category: category,
          address1: address1,
          address2: address2,
          postal_code: postal_code,
          memo: memo,
        })
      }

      markBody1(`End Page : ${pageNo}`)

      try {
        const btnNext = await page.waitForSelector("div.paging > span > a[title='zur nächsten Seite']")
        await btnNext.click()
        pageNo++
        markBody2(`Loading Next Page : ${pageNo}`)
      } catch (e) {
        hasNext = false
      }
    } catch (error) {
      console.error("Unknown error: ", error)
    }
  }

  await browser.close()
}

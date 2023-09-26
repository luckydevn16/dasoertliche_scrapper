import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import _ from "lodash"
import isUrl from "is-url"

import { deleteBusinessImageByMasterId, getBusinessByStatus, updateBusinessExtract } from "./db.js"
import { BUSINESS_STATUS, SNS_TYPE, delay, link2type, markBody1, markBody10, markBody11, markBody20, markBody3 } from "./util.js"

/**
 * ################################################################
 */
export default async function extract() {
  puppeteer.use(StealthPlugin())
  const browser = await puppeteer.launch({ headless: "new" })
  const page = await browser.newPage()

  const businesses = await getBusinessByStatus(BUSINESS_STATUS.Scrapped)

  let result = {
    success: 0,
    failure: 0,
  }

  for (let j = 0; j < businesses.length; j++) {
    markBody20(`Total: ${businesses.length}, Success: ${result.success}, Failure: ${result.failure}, Remaining: ${businesses.length - j}`)
    const b = businesses[j]

    await deleteBusinessImageByMasterId(b.id)

    markBody1(`InternalLink: ${b.internal_link}`)

    if (!isUrl(b.internal_link)){
      markBody11("Failure")
      result.failure ++
      continue
    }

    await page.goto(b.internal_link, { waitUntil: "networkidle2", timeout: 0 })

    // delay(10000)

    try {
      // await page.waitForSelector("div.slick-initialized")

      const name = await page.$eval("div.business-main > span > h1", (el) => el?.innerHTML?.trim() ?? "")
      markBody3(`name: ${name}`)

      const score = await page.$eval("div.business-score-value", (el) => parseFloat(el?.innerHTML?.trim()) ?? 0)
      markBody3(`score: ${score}`)

      const description = await page.$eval("p.business-descp", (el) => el?.innerHTML?.trim() ?? "")
      markBody3(`description: ${description}`)

      const address = await page.$eval("div.business-data-info_address > span", (el) => el?.innerHTML?.trim() ?? "")
      markBody3(`address: ${address}`)

      let website = ""
      try {
        website = await page.$eval("a.business-data-info-href", (el) => el?.href ?? "")
        markBody3(`website: ${website}`)
      } catch (e) {}

      let tel = ""
      try {
        tel = await page.$eval("div.business-data-info_tel > a", (el) => el?.innerHTML?.trim() ?? "")
        markBody3(`tel: ${tel}`)
      } catch (e) {}

      let socials = []
      try {
        socials = await page.$$eval("div.sr-cs-icons > a[rel=nofollow]", (elements) =>
          elements?.map((e) => ({
            link: e.getAttribute("href"),
          })) ?? []
        )
        markBody3(`socials: ${socials}`)
      } catch (e) {}
      
      let images = []
      try {
        const images = await page.$$eval("div.slick-track > div.slick-slide > img", (elements) =>
          elements?.map((e) => ({
            url: e.getAttribute("data-src") || e.getAttribute("src"),
          })) ?? []
        )
        markBody3(`images: ${images}`)
      } catch (e) {}      

      const uniqueImages = _.uniqWith(images, (arrVal, othVal) => arrVal.url === othVal.url)

      let linkedin = ""
      let facebook = ""
      let twitter = ""
      let instagram = ""

      for (let i = 0; i < socials.length; i++) {
        const one = socials[i]
        const type = link2type(one.link)

        switch (type) {
          case SNS_TYPE.Linkedin:
            linkedin = one.link
            break
          case SNS_TYPE.Facebook:
            facebook = one.link
            break
          case SNS_TYPE.Twitter:
            twitter = one.link
            break
          case SNS_TYPE.Instagram:
            instagram = one.link
            break
        }
      }

      await updateBusinessExtract(b.id, {
        name,
        score,
        description,
        address,
        website,
        tel,

        linkedin,
        facebook,
        twitter,
        instagram,

        images: uniqueImages.map((img) => ({
          category_id: b.category_id,
          category_value: b.category_value,
          category_label: b.category_label,

          country_id: b.country_id,
          country_value: b.country_value,
          country_code: b.country_code,
          country_label: b.country_label,
          url: img.url,
        })),
      })

      result.success ++
      markBody10("Success")
    } catch (e) {
      result.failure ++
      markBody11("Failure")
      continue
    }
  }
}

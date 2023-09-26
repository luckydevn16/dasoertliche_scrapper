import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import _ from "lodash"
import isUrl from "is-url"

import { deleteBusinessImageByMasterId, getBusinessByStatus, updateBusinessExtract } from "./db.js"
import {
  BUSINESS_STATUS,
  SNS_TYPE,
  delay,
  link2type,
  markBody1,
  markBody10,
  markBody11,
  markBody20,
  markBody3,
} from "./util.js"

export async function extractOne(browser, business) {
  const page = await browser.newPage()

  await deleteBusinessImageByMasterId(business.id)

  markBody3(`BusinessID: ${business.id} - InternalLink: ${business.internal_link}`)

  if (!isUrl(business.internal_link)) {
    await page.close()
    return false
  }

  await page.goto(business.internal_link, { waitUntil: "networkidle2", timeout: 0 })

  try {
    let name = ""
    try {
      name = await page.$eval("div.business-main > span > h1", (el) => el?.innerHTML?.trim() ?? "")
      markBody3(`BusinessID: ${business.id} - name: ${name}`)
    } catch (e) {}

    let score = 0
    try {
      score = await page.$eval("div.business-score-value", (el) => parseFloat(el?.innerHTML?.trim()) ?? 0)
      markBody3(`BusinessID: ${business.id} - score: ${score}`)
    } catch (e) {}

    let description = ""
    try {
      description = await page.$eval("p.business-descp", (el) => el?.innerHTML?.trim() ?? "")
      markBody3(`BusinessID: ${business.id} - description: ${description}`)
    } catch (e) {}

    let address = ""
    try {
      address = await page.$eval("div.business-data-info_address > span", (el) => el?.innerHTML?.trim() ?? "")
      markBody3(`BusinessID: ${business.id} - address: ${address}`)
    } catch (e) {}

    let website = ""
    try {
      website = await page.$eval("a.business-data-info-href", (el) => el?.href ?? "")
      markBody3(`BusinessID: ${business.id} - website: ${website}`)
    } catch (e) {}

    let tel = ""
    try {
      tel = await page.$eval("div.business-data-info_tel > a", (el) => el?.innerHTML?.trim() ?? "")
      markBody3(`BusinessID: ${business.id} - tel: ${tel}`)
    } catch (e) {}

    let socials = []
    try {
      socials = await page.$$eval(
        "div.sr-cs-icons > a[rel=nofollow]",
        (elements) =>
          elements?.map((e) => ({
            link: e.getAttribute("href"),
          })) ?? []
      )
      markBody3(`BusinessID: ${business.id} - socials: ${socials}`)
    } catch (e) {}

    let images = []
    try {
      images = await page.$$eval(
        "div.slick-track > div.slick-slide > img",
        (elements) =>
          elements?.map((e) => ({
            url: e.getAttribute("data-src") || e.getAttribute("src"),
          })) ?? []
      )
      markBody3(`BusinessID: ${business.id} - images: ${images}`)
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

    await updateBusinessExtract(business.id, {
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
        category_id: business.category_id,
        category_value: business.category_value,
        category_label: business.category_label,

        country_id: business.country_id,
        country_value: business.country_value,
        country_code: business.country_code,
        country_label: business.country_label,
        url: img.url,
      })),
    })

    await page.close()
    return true
  } catch (e) {
    await page.close()
    return false
  }
}

/**
 * ################################################################
 */
export default async function extract() {
  puppeteer.use(StealthPlugin())
  const browser = await puppeteer.launch({ headless: "new" })

  const businesses = await getBusinessByStatus(BUSINESS_STATUS.Scrapped)

  let result = {
    success: 0,
    failure: 0,
  }

  for (let j = 0; j < businesses.length; j += 10) {
    markBody20(
      `Total: ${businesses.length}, Success: ${result.success}, Failure: ${result.failure}, Remaining: ${
        businesses.length - j
      }`
    )

    try {
      const res = await Promise.all([
        extractOne(browser, businesses[j]),
        extractOne(browser, businesses[j + 1]),
        extractOne(browser, businesses[j + 2]),
        extractOne(browser, businesses[j + 3]),
        extractOne(browser, businesses[j + 4]),
        extractOne(browser, businesses[j + 5]),
        extractOne(browser, businesses[j + 6]),
        extractOne(browser, businesses[j + 7]),
        extractOne(browser, businesses[j + 8]),
        extractOne(browser, businesses[j + 9]),
      ])

      result.success += res.filter((v) => v === true).length
      result.failure += res.filter((v) => v === false).length
    } catch (e) {}
  }
}

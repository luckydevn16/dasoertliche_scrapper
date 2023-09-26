import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"

import initializeDB, { insertCategory, insertCountry } from "./db.js"
import { CATEGORY_STATUS, markBody1, markBody2 } from "./util.js"

/**
 * ################################################################
 */
async function scrapCategory(page) {
  let categories = await page.$$eval(
    "select#filterCategory > option",
    (options) =>
      options.map((option) => ({ value: option.value, label: option.label }))
  )

  categories = categories.filter((c) => c.value !== "")
  categories = categories.map((c) => ({ ...c, status: CATEGORY_STATUS.None }))

  markBody2("Category Inserting Started")
  const ids = await insertCategory(categories)
  markBody2("Category Inserting Ended")

  if (categories.length !== ids.length) {
    return null
  }

  return categories.map((c, index) => ({ id: ids[index], ...c }))
}

/**
 * ################################################################
 */
async function scrapCountry(page) {
  let countries = await page.$$eval(
    "select#filterCountry > option",
    (options) =>
      options.map((option) => ({
        value: option.value,
        code: option.getAttribute("data-code"),
        label: option.label,
      }))
  )

  countries = countries.filter((c) => c.value !== "")

  markBody2("Country Inserting Started")
  const ids = await insertCountry(countries)
  markBody2("Country Inserting Ended")

  if (countries.length !== ids.length) {
    return null
  }

  return countries.map((c, index) => ({ id: ids[index], ...c }))
}

/**
 * ################################################################
 */
export default async function initialize() {
  markBody1("Database Initializing Started")
  await initializeDB()
  markBody1("Database Initializing Ended")

  puppeteer.use(StealthPlugin())
  const browser = await puppeteer.launch({ headless: "new" })
  const page = await browser.newPage()
  await page.goto("https://trustanalytica.com/us/top-gyms", {
    waitUntil: "networkidle2",
  })

  markBody1("Category Scrapping Started")
  await scrapCategory(page)
  markBody1("Category Scrapping Ended")

  markBody1("Country Scrapping Started")
  await scrapCountry(page)
  markBody1("Country Scrapping Ended")

  await browser.close()
}

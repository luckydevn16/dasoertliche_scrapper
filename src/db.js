import sqlite3 from "sqlite3"
import { open } from "sqlite"
import fs from "fs"
import path from "path"

import { BUSINESS_STATUS, markBody1 } from "./util.js"

const fileName = process.env.SQLITE3_DB ?? "trustanalytica.db"

/**
 * ################################################################
 */
export default async function initializeDB() {
  if (fs.existsSync(path.join(process.cwd(), fileName))) {
    fs.unlinkSync(path.join(process.cwd(), fileName))
  }

  const db = await open({ filename: fileName, driver: sqlite3.Database })

  await db.exec(
    `CREATE TABLE category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value TEXT,
      label TEXT,
      status INTEGER
    )`
  )

  await db.exec(
    `CREATE TABLE country (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value TEXT,
      code TEXT,
      label TEXT
    )`
  )

  await db.exec(
    `CREATE TABLE business (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      
      category_id INTEGER,
      category_value TEXT,
      category_label TEXT,

      country_id INTEGER,
      country_value TEXT, 
      country_code TEXT,
      country_label TEXT,
      
      internal_link TEXT,
      name TEXT,
      score REAL,
      description TEXT,
      address TEXT,
      website TEXT,
      tel TEXT,

      linkedin TEXT,
      facebook TEXT,
      twitter TEXT,
      instagram TEXT,

      status INTEGER
    )`
  )

  await db.exec(
    `CREATE TABLE business_image (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      category_id INTEGER,
      category_value TEXT,
      category_label TEXT,

      country_id INTEGER,
      country_value TEXT, 
      country_code TEXT,
      country_label TEXT,
      
      business_id INTEGER,
      url TEXT,
      blob BLOB,
      sort INTEGER
    )`
  )

  await db.close()
}

/**
 * ################################################################
 */
export async function getCategoryByStatus(status) {
  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READONLY })
  const categories = await db.all(`SELECT * FROM category WHERE status = ${status}`);
  await db.close()
  return categories
}

/**
 * ################################################################
 */
export async function insertCategory(categories) {
  if (!categories || categories.length <= 0) return

  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READWRITE })

  const ids = []
  for (let i = 0; i < categories.length; i++) {
    const one = categories[i]

    const result = await db.run("INSERT INTO category (value, label, status) VALUES (:value, :label, :status)", {
      ":value": one.value,
      ":label": one.label,
      ":status": one.status
    })

    ids.push(result.lastID)
  }

  await db.close()

  return ids
}

/**
 * ################################################################
 */
export async function updateCategoryStatus(categoryId, status) {
  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READWRITE })
  
  await db.run(`UPDATE category SET status = ${status} WHERE id = ${categoryId}`)
  
  await db.close()
}

/**
 * ################################################################
 */
export async function getCountry() {
  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READONLY })

  const countries = await db.all(`SELECT * FROM country`);

  await db.close()

  return countries
}

/**
 * ################################################################
 */
export async function insertCountry(countries) {
  if (!countries || countries.length <= 0) return

  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READWRITE })

  const ids = []
  for (let i = 0; i < countries.length; i++) {
    const one = countries[i]

    const result = await db.run("INSERT INTO country (value, code, label) VALUES (:value, :code, :label)", {
      ":value": one.value,
      ":code": one.code,
      ":label": one.label
    })

    ids.push(result.lastID)
  }

  await db.close()

  return ids
}

/**
 * ################################################################
 */
export async function getBusinessByStatus(status) {
  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READONLY })
  const businesses = await db.all(`SELECT * FROM business WHERE status = ${status}`);
  await db.close()
  return businesses
}

/**
 * ################################################################
 */
export async function insertBusinessScrap(businesses) {
  if (!businesses || businesses.length <= 0) return

  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READWRITE })

  const ids = []  
  for (let i = 0; i < businesses.length; i ++){
    const one = businesses[i]

    const result = await db.run(`INSERT INTO business 
      (
        category_id, 
        category_value, 
        category_label, 
        country_id, 
        country_value, 
        country_code, 
        country_label,    
        internal_link,
        status
      )
      VALUES 
      (
        :category_id, 
        :category_value, 
        :category_label, 
        :country_id, 
        :country_value, 
        :country_code, 
        :country_label,
        :internal_link,
        :status
      )`, {
      ":category_id": one.category_id,
      ":category_value": one.category_value,
      ":category_label": one.category_label,
      ":country_id": one.country_id,
      ":country_value": one.country_value,
      ":country_code": one.country_code,
      ":country_label": one.country_label,
      ":internal_link": one.internal_link,
      ":status": BUSINESS_STATUS.Scrapped
    })

    ids.push(result.lastID)
  }

  await db.close()

  return ids
}

/**
 * ################################################################
 */
export async function deleteBusinessByCategory(categories) {
  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READWRITE })

  for (let i = 0; i < categories.length; i ++) {
    const category = categories[i]

    await db.run(`DELETE FROM business WHERE category_id = :category_id`, {
      ":category_id": category.id
    })
  }

  await db.close()
}

/**
 * ################################################################
 */
export async function updateBusinessExtract(id, data) {
  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READWRITE })

  await db.run(
    `UPDATE business 
    SET name = :name,
        score = :score,
        description = :description,
        address = :address,
        website = :website,
        tel = :tel,

        linkedin = :linkedin,
        facebook = :facebook,
        twitter = :twitter,
        instagram = :instagram,
        status = :status
    WHERE id = :id`, {
      ":name": data.name,
      ":score": data.score,
      ":description": data.description,
      ":address": data.address,
      ":website": data.website,
      ":tel": data.tel,

      ":linkedin": data.linkedin,
      ":facebook": data.facebook,
      ":twitter": data.twitter,
      ":instagram": data.instagram,
      ":status": BUSINESS_STATUS.Extracted,
      
      ":id": id
    }
  )

  if (!data.images || data.images.length <= 0) return

  for (let i = 0; i < data.images.length; i++) {
    const one = data.images[i]

    await db.run(
      `INSERT INTO business_image 
      (
        category_id,
        category_value,
        category_label,
  
        country_id,
        country_value, 
        country_code,
        country_label,

        business_id,
        url,
        sort
      )
      VALUES (
        :category_id,
        :category_value,
        :category_label,

        :country_id,
        :country_value, 
        :country_code,
        :country_label,

        :business_id,
        :url,
        :sort
      )`, {
      ":category_id": one.category_id,
      ":category_value": one.category_value,
      ":category_label": one.category_label,

      ":country_id": one.country_id,
      ":country_value": one.country_value, 
      ":country_code": one.country_code,
      ":country_label": one.country_label,

      ":business_id": id,
      ":url": one.url,
      ":sort": i + 1,
    })
  }

  await db.close()
}

/**
 * ################################################################
 */
export async function deleteBusinessImageByCategory(categories) {
  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READWRITE })

  for (let i = 0; i < categories.length; i ++) {
    const category = categories[i]

    await db.run(`DELETE FROM business_image WHERE category_id = :category_id`, {
      ":category_id": category.id
    })
  }

  await db.close()
}

export async function deleteBusinessImageByMasterId(masterId) {
  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READWRITE })
  await db.run(`DELETE FROM business_image WHERE business_id = ${masterId}`)
  await db.close()
}
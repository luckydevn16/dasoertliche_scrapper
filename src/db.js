import sqlite3 from "sqlite3"
import { open } from "sqlite"
import fs from "fs"
import path from "path"

const fileName = process.env.SQLITE3_DB ?? "dasoertliche.db"

/**
 * ################################################################
 */
export default async function initializeDB() {
  if (fs.existsSync(path.join(process.cwd(), fileName))) {
    fs.unlinkSync(path.join(process.cwd(), fileName))
  }

  const db = await open({ filename: fileName, driver: sqlite3.Database })

  await db.exec(
    `CREATE TABLE dasoertliche (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      
      site TEXT,
      type TEXT,
      keyword TEXT,
      page INTEGER,

      internal_link TEXT,
      title TEXT,
      category TEXT,
      address1 TEXT,
      address2 TEXT,
      postal_code TEXT,
      memo TEXT
    )`
  )

  await db.close()
}

/**
 * ################################################################
 */
export async function insertDasoertliche(data) {
  console.log("insertDasoertliche data:", data)
  const db = await open({ filename: fileName, driver: sqlite3.Database, mode: sqlite3.OPEN_READWRITE })

  const result = await db.run(`INSERT INTO dasoertliche 
    (
      site,
      type,
      keyword,
      page,
      
      internal_link,
      title,
      category,
      address1,
      address2,
      postal_code,
      memo
    )
    VALUES 
    (
      :site,
      :type,
      :keyword,
      :page,

      :internal_link,
      :title,
      :category,
      :address1,
      :address2,
      :postal_code,
      :memo
    )`, {
    ":site": data.site,
    ":type": data.type,
    ":keyword": data.keyword,
    ":page": data.page,
    
    ":internal_link": data.internal_link,
    ":title": data.title,
    ":category": data.category,
    ":address1": data.address1,
    ":address2": data.address2,
    ":postal_code": data.postal_code,
    ":memo": data.memo
  })

  await db.close()

  return result.lastID
}
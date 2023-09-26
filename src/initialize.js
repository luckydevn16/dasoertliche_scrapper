import initializeDB from "./db.js"
import { markBody1 } from "./util.js"

/**
 * ################################################################
 */
export default async function initialize() {
  markBody1("Database Initializing Started")
  await initializeDB()
  markBody1("Database Initializing Ended")
}

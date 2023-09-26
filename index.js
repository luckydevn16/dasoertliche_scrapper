import "dotenv/config"

import scrap from "./src/scrap.js"
import seed from "./src/seed.js"
import initialize from "./src/initialize.js"
import { markEnd, markStart } from "./src/util.js"
import extract from "./src/extract.js"

const stage = parseInt(process.env.STAGE, 10) ?? 1

if (stage === 1) {
  markStart("Initializing Started")
  await initialize();
  markEnd("Initializing Ended")
  
  markStart("Scrapping Started")
  await scrap()
  markEnd("Scrapping Ended")

  markStart("Extracting Started")
  await extract()
  markEnd("Extracting Ended")

  markStart("Seeding Started")
  await seed()
  markEnd("Seeding Ended")
}

if (stage === 2) {
  markStart("Scrapping Started")
  await scrap()
  markEnd("Scrapping Ended")

  markStart("Extracting Started")
  await extract()
  markEnd("Extracting Ended")

  markStart("Seeding Started")
  await seed()
  markEnd("Seeding Ended")
}

if (stage === 3) {
  markStart("Extracting Started")
  await extract()
  markEnd("Extracting Ended")

  markStart("Seeding Started")
  await seed()
  markEnd("Seeding Ended")
}

if (stage === 4) {
  markStart("Seeding Started")
  await seed()
  markEnd("Seeding Ended")
}

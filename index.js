import "dotenv/config"

import scrap1 from "./src/scrap1.js"
import scrap2 from "./src/scrap2.js"
import scrap3 from "./src/scrap3.js"
import initialize from "./src/initialize.js"
import { markEnd, markStart } from "./src/util.js"

const stage = parseInt(process.env.STAGE, 10) ?? 1

if (stage === 1) {
  markStart("Initializing Started")
  await initialize();
  markEnd("Initializing Ended")
  
  markStart("Scrapping 1st Site Started")
  await scrap1()
  markEnd("Scrapping 1st Site Ended")

  markStart("Scrapping 2nd Site Started")
  await scrap2()
  markEnd("Scrapping 2nd Site Ended")

  markStart("Scrapping 3rd Site Started")
  await scrap3()
  markEnd("Scrapping 3rd Site Ended")
}

if (stage === 2) {
  markStart("Scrapping 1st Site Started")
  await scrap1()
  markEnd("Scrapping 1st Site Ended")

  markStart("Scrapping 2nd Site Started")
  await scrap2()
  markEnd("Scrapping 2nd Site Ended")

  markStart("Scrapping 3rd Site Started")
  await scrap3()
  markEnd("Scrapping 3rd Site Ended")
}

if (stage === 3) {
  markStart("Scrapping 2nd Site Started")
  await scrap2()
  markEnd("Scrapping 2nd Site Ended")

  markStart("Scrapping 3rd Site Started")
  await scrap3()
  markEnd("Scrapping 3rd Site Ended")
}

if (stage === 4) {
  markStart("Scrapping 3rd Site Started")
  await scrap3()
  markEnd("Scrapping 3rd Site Ended")
}

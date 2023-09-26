import colors from "colors"

export const SNS_TYPE = {
  Linkedin: "Linkedin",
  Facebook: "Facebook",
  Twitter: "Twitter",
  Instagram: "Instagram",
}

export const CATEGORY_STATUS = {
  None: 0,
  Scrapped: 1,
  Extracted: 2
}

export const BUSINESS_STATUS = {
  None: 0,
  Scrapped: 1,
  Extracted: 2
}

export function link2type(link) {
  if (link.indexOf("linkedin") !== -1) {
    return SNS_TYPE.Linkedin
  }

  if (link.indexOf("facebook") !== -1) {
    return SNS_TYPE.Facebook
  }

  if (link.indexOf("twitter") !== -1) {
    return SNS_TYPE.Twitter
  }

  if (link.indexOf("instagram") !== -1) {
    return SNS_TYPE.Instagram
  }

  return null
}

export function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export function markStart(memo) {
  console.log(colors.cyan("################################################################"))
  console.log(colors.cyan(`---------------- ${memo} ----------------\n`))
}

export function markEnd(memo) {
  console.log(colors.cyan(`---------------- ${memo} ----------------`))
  console.log(colors.cyan("################################################################\n"))
}

export function markBody1(memo) {
  console.log(colors.magenta(`------------ ${memo} ------------`))
}

export function markBody2(memo) {
  console.log(colors.blue(`-------- ${memo} --------`))
}

export function markBody3(memo) {
  console.log(colors.yellow(`${memo}`))
}

export function markBody10(memo) {
  console.log(colors.bgGreen(`-------- ${memo} --------`))
}

export function markBody11(memo) {
  console.log(colors.bgRed(`-------- ${memo} --------`))
}

export function markBody20(memo) {
  console.log(colors.bgWhite(colors.black(colors.italic(`-------- ${memo} --------`))))
}
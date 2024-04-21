// script to update S&P500 in EUR

/**
 * @ignore
 * There was a problem using this script on server.
 */

const puppeteer = require("puppeteer")
const cheerio = require("cheerio")


const pageToTraverse = "https://www.spglobal.com/spdji/en/indices/equity/sp-500";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clickOnDropDownAndSelect = async (page, dropDownBtnSelector, dropDownMenuSelector, elToClickSelector) => {
    
    await page.click(dropDownBtnSelector, {offset: {x: 10, y: 10}})

    await page.waitForSelector(dropDownMenuSelector)

    const finalBtn = await page.waitForSelector(elToClickSelector)

    await finalBtn.click()
}

(async () => {
    // starts puppeteer browser
    const browser = await puppeteer.launch({product: "chrome"}/* {headless: false,  args:[
        '--start-maximized' // you can also use '--start-fullscreen'
    ]} */)
    const page = await browser.newPage()

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0")
    
    await page.goto(pageToTraverse)
    await page.setViewport({width: 1980, height: 1024})

    await delay(2500)

    await clickOnDropDownAndSelect(page, ".currency", ".dropdown-menu", "text/EUR")

    await delay(2500)

    let html = cheerio.load(await page.content())
    html(".index-level").each((_, e) => console.log(e.children[0].data.replace(",", " ")))

   
   // await browser.close()
})()
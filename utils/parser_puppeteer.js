/**
 * Script to parse lbma.org webpage using puppeteer and cheerio. This script can be used to scrape SPAs, using puppeteer library to simulate user clicking and cheerio to parse html content of given page.
 * @namespace Utils.Parser_puppeteer
*/

const puppeteer = require("puppeteer")
const cheerio = require("cheerio")
const fs = require("fs")

const pageToTraverse = "https://www.lbma.org.uk/prices-and-data/precious-metal-prices#/table";

/**
 * Helper function to delay simulated clicking
 * @memberof Utils.Parser_puppeteer
 * @param {number} ms how many ms should the delay be
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Function to open dropdown menu a click on given element
 * @memberof Utils.Parser_puppeteer
 * @param {puppeteer.Page} page - reference to opened page
 * @param {string} dropDownBtnSelector - CSS selector for element that opens drop down menu when clicked
 * @param {string} dropDownMenuSelector - CSS selector of drop down menu - this function waits until element with this selector is present 
 * @param {string} elToClickSelector - CSS selector for element to be clicked inside drop down
 */
const clickOnDropDownAndSelect = async (page, dropDownBtnSelector, dropDownMenuSelector, elToClickSelector) => {
    
    await page.click(dropDownBtnSelector, {offset: {x: 10, y: 10}})

    await page.waitForSelector(dropDownMenuSelector)

    const finalBtn = await page.waitForSelector(elToClickSelector)

    await finalBtn.click()
}
// holds final data to be written
let resData = []

/**
 * Function to parse HTML content of webpage with Cheerio. Change selector on line ~48 to parse different webpage, also update logic inside callback function to make it work with different website
 * @memberof Utils.Parser_puppeteer
 * @param {string} body - html content of given page
 * @param {number} year  - which year is beign parsed
 */
const parsePage = async (body, year) => {
    console.log(`Parsujem rok ${year}`)
    const html = cheerio.load(body)
    let res = {year: []} 
    html(".pepper-responsive-table tbody tr").each((i, e) => {
        let children = e.children
        let r = []
        for(let i = 0; i < children.length; i++){
            if(children[i].attribs.class === "-index0" || children[i].attribs.class === "-index3"){
                r.push([children[i].children[0].data])
            }
        }
        res.year.push(r)
    })
    resData.push(res)
}

/**
 * Function to write result CSV file. You should update path on line ~70 to result file.
 * @memberof Utils.Parser_puppeteer
 */
const writeResFile = () => {
    // everybody loves JS Array.reverse() :) reversing in place FTW /s
    resData.reverse()
    // epic one-liner, if you are reading this code and you are not me, please forgive me for the line below
	// we need to reverse whole resData array because we started on year 1999
    let data = resData.map(e => e.year.map(r=>r.join(";")).reverse().join("\n")).join("\n")
    fs.writeFileSync("./res/silver_euro.csv", data, {encoding: "utf-8"})
}

// main driver
(async () => {
    // starts puppeteer browser
    const browser = await puppeteer.launch({headless: false,  args:[
        '--start-maximized' // you can also use '--start-fullscreen'
     ]})
    const page = await browser.newPage()
    
    await page.goto(pageToTraverse)
    await page.setViewport({width: 1980, height: 1024})

    await delay(2500)

    //switch to silver
    await clickOnDropDownAndSelect(page, ".metals-dropdown", ".dropdown-menu", ".metals-dropdown .dropdown-menu li:nth-child(2)")
    
    // firstly parse year 2024 because for some reason when I started on year 1999, I wasn't able to get to year 2024 (puppeteer wasn't able to click on year 2024 for some reason)
    await parsePage(await page.content(), 2024)

    // traverse pages from 2023 to 1999
    for(let i = 2023; i >= 1999; i--){
        await clickOnDropDownAndSelect(page, ".year-dropdown", ".dropdown-menu", `text/${i}`)
        await delay(1000)
        await parsePage(await page.content(), i)
    } 

    console.log("Vyparsovane")
    console.log("Zapisuje csv subor")
    writeResFile()
    await browser.close()
})()
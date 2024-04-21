/**
 * HTML parser using cheerio
 * @namespace Utils.HTML_parser
 */


const cheerio = require("cheerio")
const fs = require("fs")



const default_page = "https://www.usagold.com/daily-silver-price-history/?ddYears="

/**
 * Fetches html content of given page using Fetch API.
 * @param {string} page - URL address
 * @returns {string} - text of response
 * @memberof Utils.HTML_parser 
 */
async function getPage(page){
    console.log(`Ziskavam ${page}`)
    const req = await fetch(page)
    const body = await req.text()
    if(body)
        return body
}

/**
 * Function to parse page with given URL address. Retrieves HTML content of page by calling {@link Utils.HTML_parser.getPage}. Then loads html using Cheerio, and thanks to that parses table from given page.
 * To parse different page, you need to update selector for table to be parsed on line 43.
 * @param {string} page - URL address
 * @returns {Object} with {success, (Array.<string> | string)} format
 * @memberof Utils.HTML_parser
 */
async function parsePage(page){
    let body = await getPage(page)
    console.log(`Parsujem ${page}`)
    if(body.includes("522: Connection timed out")){
        return {success: false, page}
    }
    const html = cheerio.load(body)
    let parsedTable = []
    html("#pricehistorytable tr").each((_, title) => { // change selector to work on different pages
        const node = html(title)
        const txt = node.text()
        let row = txt.split("\n").filter(n => n.length > 0)
        parsedTable.push(row)
    })
    return {success: true, parsedTable}

}

/**
 * Function to write parsed table to CSV file. Loops through given table data, and writes them to CSV file in &lt;date>;&lt;price> format, where date has DD.MM.YYYY format.
 * @param {Array.<string, string>} table - table data to be written.
 * @memberof Utils.HTML_parser
 */
function writeTableToFile(table){
    for(let i = 0; i < table.length; i++){
        let date = new Date(table[i][0])
        let price = Number(table[i][1])
        let parsedDate = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`
        fs.writeFileSync("./res/SilverPrices.csv", `${parsedDate};${price}\n`, {encoding: "utf-8", flag: "a"})
    }
}

/**
 * Function to parse pages in given range. This function utilizes single for loop to get URL parameter for a year. Firstly it calls {@link Utils.HTML_parser.parsePage}, when parsing was successful
 * then {@link Utils.HTML_parser.writeTableToFile} is called to write parsed table to file.
 * @memberof Utils.HTML_parser 
 */
const parseAll = async () => {
    for(let i = 1979; i < 2025; i++){
        let page = default_page.concat(String(i))
        let parsed = await parsePage(page)
        if(parsed.success){
            writeTableToFile(parsed.parsedTable)
        }
        else{
            console.log(`Chyba pri ziskavani dat z: ${page}`)
        }
        
    } 
}



parseAll()

//parsePage(default_page.concat(String(1979)))
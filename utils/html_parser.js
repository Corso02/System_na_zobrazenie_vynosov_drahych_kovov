const cheerio = require("cheerio")
const fs = require("fs")

const default_page = "https://www.usagold.com/daily-silver-price-history/?ddYears="

async function getPage(page){
    console.log(`Ziskavam ${page}`)
    const req = await fetch(page)
    const body = await req.text()
    if(body)
        return body
}

async function parsePage(page){
    let body = await getPage(page)
    console.log(`Parsujem ${page}`)
    if(body.includes("522: Connection timed out")){
        return {success: false, page}
    }
    const html = cheerio.load(body)
    let parsedTable = []
    html("#pricehistorytable tr").each((_, title) => {
        const node = html(title)
        const txt = node.text()
        let row = txt.split("\n").filter(n => n.length > 0)
        parsedTable.push(row)
    })
    return {success: true, parsedTable}

}

function writeTableToFile(table){
    for(let i = 0; i < table.length; i++){
        let date = new Date(table[i][0])
        let price = Number(table[i][1])
        let parsedDate = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`
        fs.writeFileSync("./res/SilverPrices.csv", `${parsedDate};${price}\n`, {encoding: "utf-8", flag: "a"})
    }
}


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
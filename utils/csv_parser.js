/**
 * Util to parse csv files into standardized form, expected delimeter in CSV is ';' <br>
 * Non-standard form: <br>
 * &emsp;date: M/D/Y <br>
 * &emsp;value: 1111.1 <br>
 * Standardized form: <br>
 * &emsp;date: D.M.Y <br>
 * &emsp;value: 1 111.1 <br>
 * Standardized CSV file will be outputed to /utils/res/Standardized.csv <br>
 * Traverses given CSV file with &lt;date>;&lt;price> on each line 
 * 
 * @namespace Utils.CSV_parser
 */

const fs = require("fs")
const path = require("path")
const path_to_file = path.resolve("./SilverPrices.csv")

let fileLines = fs.readFileSync(path_to_file, {encoding: "utf-8"}).split("\n")
let res = []

for(let i = 0; i < fileLines.length; i++){
    let lineToPrase = fileLines[i]
    if(!(/[0-9]/g.test(lineToPrase))){
        res.push(lineToPrase)
        continue
    }
    let lineToPraseParts = lineToPrase.split(";")
    let resLine = []
    for(let j = 0; j < lineToPraseParts.length; j++){
        if(lineToPraseParts[j].length === 0){
            resLine.push("")
            continue
        }
        if(lineToPraseParts[j].includes("/")){
            resLine.push(parseDate(lineToPraseParts[j], 24, false))
        }
        if(lineToPraseParts[j].includes(".")){
            resLine.push(parseNumber(lineToPraseParts[j]))
        }
    }
    res.push(resLine.join(";"))
}

fs.writeFileSync("res/Standardized.csv", res.join("\n"), {encoding: "utf-8"})
console.log("CSV file was parsed succesfully")


/**
 * Function to parse date from M/D/Y form to D.M.Y
 * @param {string} dateStr date as string in M/D/Y form
 * @param {number} century_21_limit if year is higher than this limit, 19 will be added in front of it, otherwise 20 will be added 
 * @returns {string} date in string format D.M.Y
 * @memberof Utils.CSV_parser
 */
function parseDate(dateStr, century_21_limit, appendLimit = true){
    let parts = dateStr.split("/")
    let day = parts[1]
    let month = parts[0]
    let yearNumber = Number(parts[2])
    let addZero = yearNumber < 10
    let year = `${addZero ? "0" : ""}${yearNumber}`
    if(appendLimit)
        year = yearNumber > century_21_limit ? `19${year}` : `20${year}`
    return `${day}.${month}.${year}`

}

/**
 * Function to parse number from 1111.1 form to 1 111.1
 * @param {string} numberStr number as string in 1111.1 form 
 * @returns {string} number in string format 1 111.1
 * @memberof Utils.CSV_parser
 */
function parseNumber(numberStr){
    let parts = numberStr.split(".")
    let fractionalPart = parts[0]
    let decimals = parts[1]
    if(fractionalPart.length > 3){
        let newFractionalPart = []
        for(let i = fractionalPart.length - 1; i >= 0; i--){
            if((newFractionalPart.length) % 3 === 0 && newFractionalPart.length != 0){
                newFractionalPart.push(" ")
            }
            newFractionalPart.push(fractionalPart[i])
        }
        fractionalPart = newFractionalPart.reverse().join("")
    }
    return `${fractionalPart}.${decimals}`
}

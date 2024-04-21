// @ts-check

/**
 * Class for generating HTML tables for my bachelor thesis
 * Created by Peter Vanát 2024
 * @memberof Tables
 * @class
 */

class TableGenerator{

    /**
     * Constructor for TableGenerator class
     * @param {Array.<number>} calculations array of calculations to be put into the table
     * @param {number} fromYear start year for the table
     * @param {number} toYear end year for the table
     */
    constructor(calculations, fromYear, toYear){
        /** @type {Array.<number>} */
        this.calculations = calculations
        /** @type {number} */
        this.fromYear = Number(fromYear)
        /** @type {number} */
        this.toYear = Number(toYear)
        /** @type {Array.<string>} */
        this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        /** @type {number} */
        this.defaultCellWidth = 8
        /** @type {Object.<string, string>} */
        this.calcTableDictionary = {
            "initial_price": "Pôvodná cena",
            "current_price": "Dnešná cena",
            "current_price_date": "Dátum dnešnej ceny",
            "initial_investment_value": "Pôvodná hodnota investície",
            "current_investment_value": "Dnešná hodnota investície",
            "percent_change": "Zmena v %",
            "comodity_count": "Zakúpené množstvo",
            "buy_date": "Dátum nákupu"
        }
    }
    /**
     * Function to generate whole table
     * @function generateTable
     * @memberof Tables.TableGenerator
     * @returns whole table as HTMLElement
     */
    generateTable(){
        let tableElement = document.createElement("table")
        tableElement.appendChild(this.#generateHeader())
        for(let year = this.fromYear; year <= this.toYear; year++){
            let calculations = this.calculations[`year_${year}`]
            tableElement.appendChild(this.#generateRow(year, calculations))
        }
        return tableElement
    }
    /**
     * Function to generate header for row
     * @returns header for the table as HTMLElement
     */
    #generateHeader(){
        let rowElement = document.createElement("tr")
        rowElement.appendChild(document.createElement("th"))

        for(let i = 0; i < this.months.length; i++){
            let cell = document.createElement("th")
            cell.innerHTML = this.months[i]
            rowElement.appendChild(cell)
        }
        return rowElement
    }
    /**
     * Function to generate row in table
     * @param {number} year is placed in the first column of the row 
     * @param {Array.<number>} calculations array of calculations to print to table
     * @returns {HTMLElement} row as HTMLElement
     */
    #generateRow(year, calculations){
        if(calculations == null){
            return document.createElement("tr")
        }
        let rowElement = document.createElement("tr")
        let cell = document.createElement("td")
        cell.innerHTML = String(year)
        rowElement.appendChild(cell)

        let green_color = "rgba(100, 199, 100"
        let red_color = "rgba(221, 100, 100"

        for(let i = 0; i < calculations.length; i++){
            cell = document.createElement("td")
            if(String(calculations[i]).length === 0){
                cell.innerHTML = " ".repeat(this.defaultCellWidth)
            }
            else{
                if(Number(calculations[i]) < 0)
                    cell.style.backgroundColor = red_color.concat(", ", this.#getAlphaChannelValue(Number(calculations[i])), ")")
                else if(Number(calculations[i]) > 1)
                    cell.style.backgroundColor = green_color.concat(", ", this.#getAlphaChannelValue(Number(calculations[i])), ")")
                else
                    cell.setAttribute("class", "")
                cell.innerHTML = this.#normalizeCalculation(calculations[i])
            }
            rowElement.appendChild(cell)
        }
        return rowElement
    }
    /**
     * @param {number} calculation number to normalize
     * @returns {string} normalized number with two decimal places and % sign
     */
    #normalizeCalculation(calculation){
        let arr = calculation.toString().split(".")
        let calc = ""
        if(arr.length === 1){
            calc = `${calculation}.00%`
        }
        else{
            if(arr[1].length == 1)
                calc = `${calculation}0%`
            else
                calc = `${calculation}%`
        }
        // pridat medzery
        if(calc.length < this.defaultCellWidth){
            calc = calc.concat(" ".repeat(this.defaultCellWidth - calc.length))
        }
        return calc
    }

    /**
     * Function to calculate alpha channel value for RGBA color based on value in cell
     * @param {Number} number - value to calculate value for 
     */
    #getAlphaChannelValue(number){
        let step = 0.35
        return String(Math.ceil(Math.abs(number) / 5)*step)
    }

    /**
     * Function to generate table for investment calculator
     * @param {*} data 
     * @param {*} currencySign 
     * @returns {HTMLTableElement | null}
     */
    generateCalcTable(data, currencySign){
        let names = this.#extractFromObject(data, "name")
        let tableElement = document.createElement("table")
        tableElement.appendChild(this.#generateCalcTableHeader(names))
        let keys = Object.keys(data)
        let objectVariableNames = Object.keys(data[keys[0]])
        let namesToSkip = ["name", "comodity_unit", "calculated"]

        let buyDateEl = /** @type {HTMLInputElement}*/(document.getElementById("buy_date_calc"))
        if(buyDateEl === null){
            console.error("Couldnt find element with 'buy_date_calc' id")
            return null;
        }

        let buyDate_date = new Date(buyDateEl.value)
        let buyDate_str = `${buyDate_date.getDate()}.${buyDate_date.getMonth()+1}.${buyDate_date.getFullYear()}`

        for(let i = 0; i < objectVariableNames.length; i++){
            if(namesToSkip.includes(objectVariableNames[i])) continue
            if(i === 2){
                tableElement.appendChild(this.#generateCalcTableRow("buy_date", Array.from({length: Object.keys(data).length}, _ => buyDate_str), false, data, currencySign))    
                continue
            }
            let extractedData = this.#extractFromObject(data, objectVariableNames[i])
            let colored = (objectVariableNames[i] === "percent_change" || objectVariableNames[i] === "current_investment_value")
            tableElement.appendChild(this.#generateCalcTableRow(objectVariableNames[i], extractedData, colored, data, currencySign))
        }
        return tableElement
    }

    /**
     * Util function to extract value from object by given name
     * @param {Object} obj object to extract value from  
     * @param {string} key key of value to extract
     * @returns {Object}
     */
    #extractFromObject(obj, key){
        let keys = Object.keys(obj)
        let res = []
        for(let i = 0; i < keys.length; i++){
            res.push(obj[keys[i]][key])
        }
        return res;
    }

    /**
     * Function to generate header for investment calculator table
     * @param {Array.<string>} names 
     * @returns {HTMLTableRowElement}
     */
    #generateCalcTableHeader(names){
        let headerElement = document.createElement("tr")
        headerElement.appendChild(document.createElement("th"))
        for(let i = 0; i < names.length; i++){
            let el = document.createElement("th")
            el.innerHTML = names[i]
            headerElement.appendChild(el)
        }
        return headerElement;
    }

    /**
     * Function to generate one row for investement calculator table
     * @param {string} rowName - name of the row
     * @param {Array.<(string|number)>} rowData - data for given row
     * @param {boolean} coloredOutput - determines whether given row should have colored background
     * @param {Object} fullData - contains all data for table
     * @param {string} currencySign - 
     * @returns {HTMLTableRowElement}
     */
    #generateCalcTableRow(rowName, rowData, coloredOutput, fullData, currencySign){
        let row = document.createElement("tr")
        let nameEl = document.createElement("td")
        nameEl.innerHTML = this.calcTableDictionary[rowName]
        row.appendChild(nameEl)
        let units = this.#extractFromObject(fullData, "comodity_unit")
        let calculated = this.#extractFromObject(fullData, "calculated")
        let rowNamesToAddCurrencySign = ["current_investment_value", "current_price", "initial_investment_value", "initial_price"]
        for(let i = 0; i < rowData.length; i++){
            let el = document.createElement("td")
            if(rowName === "comodity_count"){
                if(!calculated[i]){
                    el.innerHTML = `Chýbajú dáta`
                }
                else el.innerHTML = `${rowData[i]} ${units[i]}`
            }
            else if(rowName === "initial_investment_value"){
                if(!calculated[i])
                    el.innerHTML = "Chýbajú dáta"
                else
                    el.innerHTML = String(rowData[i])
            }
            else{
                if(rowData[i] === 0 || (typeof rowData[i] === "string" && String(rowData[i]).replace(/ /g, "") === "0%")){
                    el.innerHTML = `Chýbajú dáta`
                }
                else el.innerHTML = String(rowData[i])
            }

            if(rowNamesToAddCurrencySign.includes(rowName) && el.innerHTML !== "Chýbajú dáta"){
                el.innerHTML += currencySign
            }

            if(i != 0 && coloredOutput){
                if(this.#getNumericValue(rowData[i]) > this.#getNumericValue(rowData[0]))
                    el.setAttribute("class", "positive")
                else
                    el.setAttribute("class", "negative")
            }
            row.appendChild(el)
        }
        return row
    }

    /**
     * Removes whitespace and/or percent sign from number represented as string
     * @param {string|number} str
     * @returns {Number}
     */
    #getNumericValue(str){
        if(typeof(str) === "string")
            return Number(str.replace(/ |%/g, ""))
        return str
    }
}
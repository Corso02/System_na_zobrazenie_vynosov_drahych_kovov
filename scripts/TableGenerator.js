/**
 * Class for generating HTML tables for my bachelor thesis
 * Created by Peter Vanát 2024
 */
class TableGenerator{
    /**
     * Constructor for TableGenerator class
     * @param {number[]} calculations array of calculations to be put into the table
     * @param {number} fromYear start year for the table
     * @param {number} toYear end year for the table
     */
    constructor(calculations, fromYear, toYear){
        this.calculations = calculations
        this.fromYear = Number(fromYear)
        this.toYear = Number(toYear)
        this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        this.defaultCellWidth = 8
        this.calcTableDictionary = {
            "initial_price": "Pôvodná cena",
            "current_price": "Dnešná cena",
            "current_price_date": "Dátum dnešnej ceny",
            "initial_investment_value": "Pôvodná hodnota investície",
            "current_investment_value": "Dnešná hodnota investície",
            "percent_change": "Zmena v %",
            "comodity_count": "Zakúpené množstvo"
        }
    }
    /**
     * Function to generate whole table
     * @returns whole table as HTMLElement
     */
    generateTable(){
        let tableElement = document.createElement("table")
        tableElement.appendChild(this.generateHeader())
        for(let year = this.fromYear; year <= this.toYear; year++){
            let calculations = this.calculations[`year_${year}`]
            tableElement.appendChild(this.generateRow(year, calculations))
        }
        return tableElement
    }
    /**
     * Function to generate header for row
     * @returns header for the table as HTMLElement
     */
    generateHeader(){
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
     * @param {number[]} calculations array of calculations to print to table
     * @returns {HTMLElement} row as HTMLElement
     */
    generateRow(year, calculations){
        if(calculations == null){
            return document.createElement("tr")
        }
        let rowElement = document.createElement("tr")
        let cell = document.createElement("td")
        cell.innerHTML = String(year)
        rowElement.appendChild(cell)

        for(let i = 0; i < calculations.length; i++){
            cell = document.createElement("td")
            if(calculations[i].length === 0){
                cell.innerHTML = " ".repeat(this.defaultCellWidth)
            }
            else{
                if(Number(calculations[i]) < 0)
                    cell.setAttribute("class", "negative")
                else if(Number(calculations[i]) > 1)
                    cell.setAttribute("class", "positive")
                else
                    cell.setAttribute("class", "")
                cell.innerHTML = this.normalizeCalculation(calculations[i])
            }
            rowElement.appendChild(cell)
        }
        return rowElement
    }
    /**
     * @param {number} calculation number to normalize
     * @returns {string} normalized number with two decimal places and % sign
     */
    normalizeCalculation(calculation){
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

    generateCalcTable(data){
        let names = this.extractFromObject(data, "name")
        let tableElement = document.createElement("table")
        tableElement.appendChild(this.generateCalcTableHeader(names))
        let keys = Object.keys(data)
        let objectVariableNames = Object.keys(data[keys[0]])
        for(let i = 0; i < objectVariableNames.length; i++){
            if(objectVariableNames[i] === "name" || objectVariableNames[i] === "comodity_unit") continue
            let extractedData = this.extractFromObject(data, objectVariableNames[i])
            let colored = (objectVariableNames[i] === "percent_change" || objectVariableNames[i] === "current_investment_value")
            tableElement.appendChild(this.generateCalcTableRow(objectVariableNames[i], extractedData, colored, data))
        }
        return tableElement
    }

    extractFromObject(data, name){
        let keys = Object.keys(data)
        let res = []
        for(let i = 0; i < keys.length; i++){
            res.push(data[keys[i]][name])
        }
        return res;
    }

    generateCalcTableHeader(names){
        let headerElement = document.createElement("tr")
        headerElement.appendChild(document.createElement("th"))
        for(let i = 0; i < names.length; i++){
            let el = document.createElement("th")
            el.innerHTML = names[i]
            headerElement.appendChild(el)
        }
        return headerElement;
    }

    generateCalcTableRow(rowName, rowData, coloredOutput, fullData){
        let row = document.createElement("tr")
        let nameEl = document.createElement("td")
        nameEl.innerHTML = this.calcTableDictionary[rowName]
        row.appendChild(nameEl)
        let units = this.extractFromObject(fullData, "comodity_unit")
        for(let i = 0; i < rowData.length; i++){
            let el = document.createElement("td")
            if(rowName === "comodity_count"){
                el.innerHTML = `${rowData[i]} ${units[i]}`
            }
            else{
                el.innerHTML = rowData[i]
            }
            if(i != 0 && coloredOutput){
                if(this.getNumericValue(rowData[i]) > this.getNumericValue(rowData[0]))
                    el.setAttribute("class", "positive")
                else
                    el.setAttribute("class", "negative")
            }
            row.appendChild(el)
        }
        return row
    }

    getNumericValue(str){
        if(typeof(str) === "string")
            return Number(str.replace(/ |%/g, ""))
        return str
    }
}
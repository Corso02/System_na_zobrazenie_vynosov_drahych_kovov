//@ts-check

/**
 * All methods in this namespace are used when we are working with generating tables, calculating comparison tables etc.
 * @namespace Tables
 */


/**
 * @typedef {Object} ParsedTable
 * @property {string} fromYear
 * @property {string} tableTitle
 * @property {Array.<Array.<string>>} tbody
 * @property {string} toYear
 */



/**
 * Function to add table for investment calculator to HTML. After calling this function, generated table is automatically added to the page. Whole table is wrapped in one div element with
 * "calc_table calc_table_long" class. 
 * @param {Object} data - retrieved from DB
 * @param {string} currencySign 
 * @memberof Tables
 */
function addCalcTable(data, currencySign){
    let tableGen = new TableGenerator([], 0, 0)
    let tableWrapper = document.createElement("div")
    tableWrapper.setAttribute("class", `calc_table calc_table_long`)
    tableWrapper.appendChild(generateCalcTableHeader())
    let tableElement = tableGen.generateCalcTable(data.calculations, currencySign)
    if(!tableElement) {return;}
    tableWrapper.appendChild(tableElement)
    tableWrapper.appendChild(generateCalcTableFooter());
    (/** @type {HTMLDivElement}*/(document.getElementById("tables"))).appendChild(tableWrapper)
}

/**
 * Function to generate header for table for investment calculator. Header contains only one image of a cross. This image has onClick event listener to delete given table.
 * @returns {HTMLDivElement} Div with image inside of it. This div has table-container-header class.
 * @memberof Tables
 */
function generateCalcTableHeader(){
    let headerContainer = document.createElement("div")
    headerContainer.setAttribute("class", "table-container-header")
    let img = document.createElement("img")
    img.src = "./imgs/cross.svg"
    img.alt = "Odstranit tabulku"
    img.addEventListener("click", deleteTable)
    headerContainer.appendChild(img)
    return headerContainer
}

/**
 * Function to generate footer for table for investment calculator. Footer cotains one button, that is used to download given table. 
 * @returns {HTMLDivElement} Div with one button inside. This div has table-footer class and buttom has "table_download_btn" id.
 * @memberof Tables
 */
function generateCalcTableFooter(){
    let wrapper = document.createElement("div")
    wrapper.setAttribute("class", "table-footer")

    let button = document.createElement("button")
    button.setAttribute("id", "table_download_btn")
    button.setAttribute("class", "btn")
    button.type = "button"
    button.textContent = "Stiahnúť tabuľku"
    button.addEventListener("click", download_calc_table)

    wrapper.appendChild(button)
    return wrapper
}

/**
 * Function to download table from investment calculator. Table is downloaded using html2canvas library.
 * @memberof Tables
 */
function download_calc_table(){
    let wrapper = this.parentElement.parentElement
    let title = "Tabuľka investície"
    //@ts-ignore
    html2canvas(wrapper.querySelector("table"))
        .then(canvas => {
            let newCanvas = document.createElement("canvas")
            let context = newCanvas.getContext("2d")
            if(!context){return;}

            let padding = 25
            newCanvas.width = canvas.width + 2 * padding
            newCanvas.height = canvas.height + 2 * padding
            context.fillStyle = "white"
            context.fillRect(0,0, newCanvas.width, newCanvas.height)

            context.drawImage(canvas, padding, padding, canvas.width, canvas.height)
            context.fillStyle = "black"
            context.font = "16px roboto"
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.fillText(title, (newCanvas.width / 2), 15)

            let base64image = newCanvas.toDataURL("image/png")
            
            const createEl = document.createElement("a")
            createEl.target = "_blank"
            createEl.href = base64image
            createEl.download = `Tabuľka`
            createEl.click()
            createEl.remove()
            
        })
}

/**
 * Function to add new table to html. Table is wrapped in one div element with "&lt;className>" class. Calls {@link Tables.generateTableContainerHeader}, then appends table to parent div and lastly calls {@link Tables.generateTableContainerFooter}.
 * In the end whole div element with table header, table itself and table footer is added to the end of the div element with "tables" class.
 * @param {HTMLTableElement} table table to be put on page
 * @param {string} className class name for table wrapper
 * @param {any[]} headerParameters contains information for header component
 * @memberof Tables
 */
function addTable(table, className, headerParameters = []){
    console.log(className)
    let template = document.createElement("div")
    template.setAttribute("class", className)
    template.appendChild(generateTableContainerHeader(className, headerParameters))
    template.appendChild(table)
    template.appendChild(generateTableContainerFooter());
    (/** @type {HTMLDivElement}*/(document.getElementById("tables"))).insertAdjacentElement("beforeend", template)
}

/**
 * Function to create basic table, gets new class name for table in "table_&lt;comodity name>_&lt;table number>" 
 * format. Calls {@link Tables.addTable} function to add table to page.
 * @param {string} comodity for which comodity is this table generated
 * @param {HTMLTableElement} table table to be put on page
 * @memberof Tables
 */
function addBasicTable(comodity, table){
    let tables = document.getElementsByClassName("table")
    let same_comodity_table_count = 0
    let class_num = 1

    for(let i = 0; i < tables.length; i++){
        if(!tables[i]) continue;
        let className = tables[i].getAttribute("class")
        if(!className) continue;

        if(className.includes(comodity)){
            same_comodity_table_count++
            // xkcd - 1171
            if(/\d/.test(className)){
                let firstPart = className.match(/\_\d+/g)
                if(firstPart){
                    let reg_match = firstPart[0].match(/\d+/g)
                    if(!reg_match) continue;
                    class_num = Number(reg_match[0]) + 1
                }
            }
        }
    }
    
    let newClass = `table ${same_comodity_table_count <= 0 ? `table_${comodity}` : `table_${comodity}_${class_num}`}`

    addTable(table, newClass)

    if(tables.length >= 1){
        let cmp_btn = (/** @type {HTMLElement}*/(document.getElementById("compare")))
        cmp_btn.style.display = "block"
        cmp_btn.addEventListener("click", compareTables)
    }
}

/**
 * Function to overwrite existing table. Calls {@link Tables.selectTable} with parameter "false", creates class name for new table and then overwrite content of given table, using {@link Tables.generateTableContainerHeader} and {@link Tables.generateTableContainerFooter}.
 * @param {string} comodity for which comodity is the new table generated
 * @param {HTMLTableElement} table table to be put on page
 * @memberof Tables
 */
async function overwriteTable(comodity,table){
    let tableToOverWriteArr = await selectTable(false)
    if(tableToOverWriteArr){

        let newClass = null
        let classToOverwrite = tableToOverWriteArr[0]
        if(classToOverwrite.includes(comodity) && !classToOverwrite.includes("comp_table")){
            newClass = `table ${classToOverwrite}`
        }
        else{
            let tables = document.getElementsByClassName("table")
            let count = 0
            for(let i = 0; i < tables.length; i++){
                let className = tables[i].getAttribute("class");
                if(!className) continue;
                if(className.includes(classToOverwrite)){
                    break
                }
                if(className.includes(comodity)){
                    count++
                }
            }
            newClass = `table ${count <= 0 ? `table_${comodity}` : `table_${comodity}_${count}`}`
        }

        let tableToOverwrite = document.getElementsByClassName(classToOverwrite)[0]
        tableToOverwrite.innerHTML = ""
        tableToOverwrite.appendChild(generateTableContainerHeader(newClass))
        tableToOverwrite.appendChild(table)
        tableToOverwrite.appendChild(generateTableContainerFooter())
        tableToOverwrite.setAttribute("class", newClass)
    }
}

/**
 * Function to generate Header for table (title, remove button, title for image)
 * @param {string} tableClass class of the wrapper element
 * @param {any[]} extraParams contains information wheter generated table is comparison table and name for comparison table
 * @returns HTMLDivElement which is header for table, with title and remove button
 * @memberof Tables
 */
function generateTableContainerHeader(tableClass, extraParams = []){
    let wrapper = document.createElement("div")
    let title = ""

    let currency = (/** @type {HTMLSelectElement}*/(document.getElementById("currency"))).value
    let comparisonTable = false

    if(extraParams.length > 0){
        comparisonTable = extraParams[0]
    }
    // title 
    let classParts = tableClass.split("_")
    let comodity = dict[classParts[1]]
    
    if(classParts.length < 3 && !comparisonTable){
        title = `Tabuľka ${comodity} (1) (${currency_dict[currency]})`
    }
    else if(comparisonTable){
        title = `Porovnanie: ${extraParams[1]}`
    }
    else{
        title = `Tabuľka ${comodity} (${Number(classParts[2]) + 1}) (${currency_dict[currency]})`
    }

    let titleElement = document.createElement("p")
    titleElement.innerHTML = title
    wrapper.appendChild(titleElement)
    
    // remove button
    let img = document.createElement("img")
    img.src = "./imgs/cross.svg"
    img.alt = "Vymazať tabuľku"
    img.title = "Vymazať tabuľku"
    img.addEventListener("click", deleteTable)
    wrapper.appendChild(img)

    // title for image
    let date = new Date((/** @type {HTMLInputElement}*/(document.getElementById("sell_date"))).value)
    let date_str = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`
    let endTypeButtons = document.getElementsByName("day_calc")
    let endType = null;
    for(let i = 0; i < endTypeButtons.length; i++){
        if((/** @type {HTMLInputElement}*/(endTypeButtons[i])).checked){
            endType = (/** @type {HTMLInputElement}*/(endTypeButtons[i])).value
            break
        }
    }
    let endTypeText = ""
    if(endType === "last"){
        endTypeText = "Vypočítavané voči poslednému dňu v mesiaci"
    }
    else if(endType === "first"){
        endTypeText = "Vypočitavané voči prvému dňu v mesiaci"
    }
    else{
        let num = (/** @type {HTMLInputElement}*/(document.getElementById("custom_day_calc_input"))).value
        endTypeText = `Vypočitavané voči ${num}. dňu v mesiaci`
    }

    

    let imageTitle = ""
    if(comparisonTable){
        imageTitle = `Porovnanie tabuliek ${extraParams[1]}`
        imageTitle = imageTitle.replace(/Tabuľka/g, "")
    }
    else{
        imageTitle = `Ročná miera zhodnotenia ${comodity === "Zlato" ? "zlata" : "S&P 500"} (Dátum predaja: ${date_str}). ${endTypeText}. (${currency_dict[currency]})`
    }

    let imageTitleElement = document.createElement('p')
    imageTitleElement.style.display = "none"
    imageTitleElement.setAttribute("id", "image_title")
    imageTitleElement.innerHTML = imageTitle
    wrapper.appendChild(imageTitleElement)

    wrapper.setAttribute("class", "table-container-header")
    return wrapper
}

/**
 * Function to remove table from the page
 * @memberof Tables
 */
function deleteTable(){
    let header = this.parentElement
    let tableWrapper = header.parentElement
    tableWrapper.innerHTML = ""
    tableWrapper.remove()
    let tables = document.getElementsByClassName("table")
    if(!tables) return
    if(tables.length < 2){
        let cmp_btn = document.getElementById("compare")
        if(!cmp_btn) return;
        cmp_btn.removeEventListener("click", compareTables)
        cmp_btn.style.display = "none"
    }
}

/**
 * Function to generate footer component for table
 * @returns HTMLDivElement with one button to download table
 * @memberof Tables
 */
function generateTableContainerFooter(){
    let wrapper = document.createElement("div")
    wrapper.setAttribute("class", "table-footer")

    let button = document.createElement("button")
    button.setAttribute("id", "table_download_btn")
    button.setAttribute("class", "btn")
    button.type = "button"
    button.textContent = "Stiahnúť tabuľku"
    button.addEventListener("click", download_table)

    wrapper.appendChild(button)
    return wrapper
}

/**
 * Function to compare tables. Calls {@link Tables.selectTable} to get classes of tables to compare. Then calls {@link Tables.parseTable} with both tables, and with returned values calls {@link Tables.compareSelectedTables}.
 * @memberof Tables
 */
async function compareTables(){
    let classes = await selectTable()
    if(classes){
        let firstTableWrapper = (/** @type {HTMLDivElement}*/(document.querySelector(`.${classes[0]}`)))
        let firstTable = parseTable((/** @type {HTMLTableElement}*/(firstTableWrapper.childNodes[1])))
        let secondTableWrapper = (/** @type {HTMLDivElement} */ (document.querySelector(`.${classes[1]}`)))
        let secondTable = parseTable((/** @type {HTMLTableElement}*/(secondTableWrapper.childNodes[1])))
        if(!firstTable || !secondTable) return;
        compareSelectedTables(firstTable, secondTable)
    }
}

/**
 * Function which let user chose one or multiple tables. Uses Swal library fo pop-up to choose tables from page.
 * @param {boolean} selectMultiple should be true if you want to let user choose two tables
 * @returns array of classes of selected tables
 * @memberof Tables
 */
async function selectTable(selectMultiple = true){
    let wrapper = (/** @type {HTMLDivElement}*/(document.getElementById("tables")))
    let tables = wrapper.childNodes
    let classes = []
    let fullClasses = []
    for(let i = 0; i < tables.length; i++){
        let tableClassName = (/** @type {HTMLDivElement}*/(tables[i])).getAttribute("class")
        if(!tableClassName) continue;
        if(tableClassName.includes("comp_table")) continue
        let classParts = tableClassName.split("_")
        let name = `Tabuľka ${dict[classParts[1]]}`
        if(classParts.length === 3)
            name = name.concat(`(${Number(classParts[2])+1})`)
        else
            name = name.concat(`(1)`)
        classes.push(name)
        fullClasses.push(tableClassName)
    }

    let options = ""
    for(let i = 0; i < classes.length; i++){
        options = options.concat(`<option value="${fullClasses[i]}">${classes[i]}</option>`)
    }

    let htmlContentForTwo = `
    <select id="swal-input1" class="swal2-select">
        ${options}
    </select>
    <select id="swal-input2" class="swal2-select">
        ${options}
    </select>
    <p style="display:none;color:red;" id="swal-paragraph-error">Zvoľte dve rôzne tabuľky</p>
    `
    let htmtContent = `
    <select id="swal-input1" class="swal2-select">
        ${options}
    </select>
    `
    //@ts-ignore
    const {value: values} = await Swal.fire({
        title: selectMultiple ? "Vyberte dve tabuľky pre porovnanie" : "Vyberte tabuľku na prepísanie",
        html: selectMultiple ? htmlContentForTwo : htmtContent,
        allowOutsideClick: false,
        showDenyButton: true,
        denyButtonText: "Zrušiť",
        preConfirm: () => {
            if(selectMultiple){
                let val1 = (/** @type {HTMLInputElement}*/(document.getElementById("swal-input1"))).value
                let val2 = (/** @type {HTMLInputElement}*/(document.getElementById("swal-input2"))).value
                if(val1 === val2){
                    (/** @type {HTMLElement}*/(document.getElementById("swal-paragraph-error"))).style.display = "block"
                    return false
                }
                return[
                    val1.split(" ")[1], val2.split(" ")[1]
                ]
            }
            else{
                return [(/** @type {HTMLInputElement}*/(document.getElementById("swal-input1"))).value.split(" ")[1]]
            }
        }
    })
    if(values){
        return values
    }

}

/**
 * Function to calculate comparison table
 * @param {ParsedTable} table1 values in this table are considered as base values
 * @param {ParsedTable} table2 values in this table are substracted from base table
 * @memberof Tables
 */
function compareSelectedTables(table1, table2){
    let body1 = table1.tbody
    let body2 = table2.tbody
    if(body1.length != body2.length){
        show_error("Vybrané tabuľky musia mať rovnaký rozmer")
        return
    }
    let table1_years = getYears(body1)
    let table2_years = getYears(body2)
    if(!compareYears(table1_years, table2_years)){
        show_error("Vybrané tabuľky musia mať rovnaký rozsah rokov")
        return
    }
    if(!checkIfCompareTableExists(table1.tableTitle, table2.tableTitle)){
        let title1 = table1.tableTitle.replace(/Tabuľka/, "").replace(/&amp;/, "&")
        let title2 = table2.tableTitle.replace(/Tabuľka/, "").replace(/&amp;/, "&")
        show_error(`Porovnanie pre tabuľky ${title1} a ${title2} už existuje.`)
        return
    }
    let table1_values = getValues(body1)
    let table2_values = getValues(body2)
    let comparisonTableValues = getComparisonValues(table1_values, table2_values)
    addComparisonTable(comparisonTableValues, table1.tableTitle, table2.tableTitle, Number(table1.fromYear), Number(table1.toYear))

}

/**
 * Function to check if comparison table for two tables already exists
 * @param {string} table1Title title of the first table
 * @param {string} table2Title title of the second table
 * @returns {boolean} true if it doesnt exist otherwise false
 * @memberof Tables
 */
function checkIfCompareTableExists(table1Title, table2Title){
    let wrapper = (/** @type {HTMLDivElement}*/(document.getElementById("tables")))
    let tables = wrapper.childNodes
    let titleToSearchFor = `Porovnanie: ${table1Title} a ${table2Title}`.replace(/&amp;/, "&")
    for(let i = 0; i < tables.length; i++){
        let table = (/** @type {HTMLDivElement}*/(tables[i]))
        let tableClass = table.getAttribute("class")
        if(!tableClass) continue;
        if(tableClass.includes("comp_table")){
            let tableHeader = table.querySelector(".table-container-header")
            if(!tableHeader) continue;
            let tableTitle = (/** @type {HTMLParagraphElement}*/(tableHeader.querySelector("p"))).innerHTML
            tableTitle = tableTitle.replace(/&amp;/, "&")
            if(tableTitle === titleToSearchFor) return false
        }
    }
    return true
}

/**
 * Function to get all years from passed table which was already parsed
 * @param {Array.<Array<string>>} table table to get years from
 * @returns {Number[]}array containing years from table
 * @memberof Tables
 */
function getYears(table){
    return table.map(row => Number(row[0]))
}

/**
 * Function to find if given years are the same
 * @param {number[]} table1_years years from the first table
 * @param {number[]} table2_years years from the second table
 * @returns {boolean} - true when all years are the same otherwise false
 * @memberof Tables
 */
function compareYears(table1_years, table2_years){
    for(let i = 0; i < table1_years.length; i++){
        if(table1_years[i] != table2_years[i])
            return false
    }
    return true
}

/**
 * Function to get number values from table
 * @param {string[][]} table table to get values from
 * @returns {number[][]} array of numbers consisting of all values from the table parsed as numbers
 * @memberof Tables
 */
function getValues(table){
    return table.map((row, idx) => idx === 0 ? [] : row.map(n => Number(n.replace("%","")))).filter(row => row.length > 0)
}

/**
 * Function to substract numbers from table2 from table1
 * @param {number[][]} data1 data from table1 
 * @param {number[][]} data2 data from table2
 * @returns array prepared to be passed to TableGenerator
 * @memberof Tables
 */
function getComparisonValues(data1, data2){
    let values = Array.from({length: data1.length}, (_, rowIdx) => Array.from({length: data1[0].length}, (_, idx) => idx === 0 ? data1[rowIdx][idx] : substractValuesForComparisonTable(data1[rowIdx][idx], data2[rowIdx][idx])))
    let res = {}
    for(let i = 0; i < values.length; i++){
        let arr = []
        for(let j = 1; j < values[i].length; j++){
            arr.push(values[i][j])
        }
        res[`year_${values[i][0]}`] = arr
    }
    return res
}

/**
 * Function to compute value for comparison table
 * @param {number} value1 value from base table
 * @param {number} value2 value from second table
 * @returns empty string if both values are 0, otherwise result from substracting value2 from value1
 * @memberof Tables
 */
function substractValuesForComparisonTable(value1, value2){
    return (value1 === 0 && value2 === 0) ? "" : Math.round((value1 - value2)*100)/100
}

/**
 * Function to parse table from HTML to JSON
 * @param {HTMLTableElement} table - table to be parsed
 * @returns {ParsedTable} Object containing data from table
 * @memberof Tables
 */
function parseTable(table){
    const tbody = Array.from(table.rows).map(row =>
        Array.from(row.cells).map(cell => String(cell.textContent)),
    )
    
    let parent = (/** @type {HTMLDivElement}*/(table.parentElement))

    let tableHeader = (/** @type {Element}*/(parent.querySelector(".table-container-header")))

    const tableTitle = (/** @type {HTMLParagraphElement}*/(tableHeader.querySelector("p"))).innerHTML

    const fromYear = tbody[0][0]
    const toYear = tbody[tbody.length-1][0]
      
    return {tbody, tableTitle, fromYear, toYear}
}

/**
 * Function to add comparison table to HTML, calls {@link Tables.addTable} to add table to page. Each comparison table have "table comp_table" class. 
 * @param {Object} tableValues array containing values for table
 * @param {string} table1_name name of the first table used for comparison
 * @param {string} table2_name name of the second table used for comparison
 * @param {number} fromYear from which year should the table be generated
 * @param {number} toYear to which year should the table be generated
 * @memberof Tables
 */
function addComparisonTable(tableValues, table1_name, table2_name, fromYear, toYear){
    let tableGen = new TableGenerator(tableValues, fromYear, toYear)
    let table = tableGen.generateTable()
    
    let newClass = `table comp_table`

    addTable(table, newClass, [true, `${table1_name} a ${table2_name}`])
}

/**
 * Function to download table using HTML2Canvas library, this function triggers download pop-up
 * @memberof Tables
 */
function download_table(){
    let wrapper = this.parentElement.parentElement
    let title = wrapper.querySelector("#image_title").innerHTML
    title = title.replace("&amp;", "&")
    //@ts-ignore
    html2canvas(wrapper.querySelector("table"))
        .then(canvas => {
            let newCanvas = document.createElement("canvas")
            let context = newCanvas.getContext("2d")
            if(!context) return;
            let padding = 25
            newCanvas.width = canvas.width + 2 * padding
            newCanvas.height = canvas.height + 2 * padding
            context.fillStyle = "white"
            context.fillRect(0,0, newCanvas.width, newCanvas.height)

            context.drawImage(canvas, padding, padding, canvas.width, canvas.height)
            context.fillStyle = "black"
            context.font = "16px roboto"
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.fillText(title, (newCanvas.width / 2), 15)

            let base64image = newCanvas.toDataURL("image/png")
            
            const createEl = document.createElement("a")
            createEl.target = "_blank"
            createEl.href = base64image
            createEl.download = `Tabuľka`
            createEl.click()
            createEl.remove()
            
        })
        
}
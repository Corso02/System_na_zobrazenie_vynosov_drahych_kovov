let form = document.querySelector('form')
form.addEventListener('submit', e => {
    e.preventDefault()
    validateForm()
})

const dictionary = {
    "gold": "Zlato",
    "sp500": "S&P 500",
    "silver": "Striebro"
}

/**
 * Function to validate form and generate new table
 * @returns null
 */
async function validateForm(){
    let radio_buttons = document.getElementsByName("table_type")
    let table_type = radio_buttons[0].checked ? radio_buttons[0].value : radio_buttons[1].value

    if(table_type === "AP"){
        
        // overenie spravnosti zadanych rokov
        years_check = check_years_input();

        if(!years_check.data_missing && !years_check.valid_order){
            show_error("Začiatočný rok nemôže byť väčší ako konečný rok")
            return false
        }

        let date_el = document.getElementById("sell_date")
        let date = date_el.value

        if(!date || years_check.data_missing){
            show_error("Prosím vyplňte chýbajúce údaje.")
            if(!date){
                date_el.setAttribute("class", "AP_only invalid_input")
            }
            else{
                date_el.setAttribute("class", "AP_only")
            }
            return false
        }
        date_el.setAttribute("class", "AP_only")

        let currency = document.getElementById("currency").value

        let comodity = document.getElementById("comodity").value


        let req_body = {
            date,
            currency,
            comodity
        }

        req_body = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")

        let url = `./API/get_price_by_date.php?${req_body}`
        // overenie ci existuje v DB zaznam ceny v dany den (den do kedy by bola investicia drzana)
        const res = await fetch(url, {
            method: "GET",
        })

        if(res.status !== 200){
            show_error("Chyba pri získavaní dát");    
            return false
        }

        const validDate = await res.json()

        let sellMargin = document.getElementById("sell_margin").value
        let buyMargin = document.getElementById("buy_margin").value

        if(!validDate.success){
            if(validDate.nearestDateFound){
                console.log(validDate)
                let nearestDate = new Date(validDate.nearestDate).toLocaleDateString()
                show_info(`Nebolo možné získať cenu z dátumu predaja. Najbližší dátum s platným záznamom: ${nearestDate}`)    
            }
            else{
                show_info("Nebolo možné získať cenu z dátumu predaja. Zvoľte iný dátum")
            }
            return false
        }
        else{
            req_body = {
                to_year: years_check.to_year,
                from_year: years_check.from_year,
                sell_date: date,
                currency,
                table_type: "AP",
                sell_margin: sellMargin,
                buy_margin: buyMargin,
                comodity

            }

            req_body = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")

            let spinner_backdrop = document.getElementById("spinner-backdrop")

            let generation_complete = false

            // ak do sekundy a pol nedostanem odpoved z backend-u, zapnem animaciu nacitavania aby bol pouzivatlel informovany ze sa jeho poziadavka este spracuvava
            // nasledne kazde 0.2 sekundy kontrolujem ci som dostal odpoved ak ano, animaciu vypnem
            setTimeout(() => {
                if(!generation_complete){
                    spinner_backdrop.style.display = "flex"
                    let intervalId = setInterval(() => {
                        if(generation_complete){
                            clearInterval(intervalId)
                            spinner_backdrop.style.display = "none"
                        }
                    }, 200)
                }
            }, 1500)            

            console.log(req_body)

            let url = `./API/TableAPI.php?${req_body}`
            // samotny request na hodnoty pre tabulku
            const req = await fetch(url, {
                method: "GET",
/*                 headers: {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
                body: req_body */
            })

            
            
            if(req.status !== 200){
                generation_complete = true
                show_error("Chyba pri získavaní dát");    
            }


            const res = await req.json()
                    .catch(err => {
                        generation_complete = true
                        show_error("Chyba pri spracovaní dát zo servera")
                    })

            // vygenerujem si tabulku
            let tableGen = new TableGenerator(res,  years_check.from_year, years_check.to_year)
            let table = tableGen.generateTable();

            let comodity_lower = comodity.toLowerCase()

            // pridanie tabulky alebo nahradenie uz existujucej tabulky
            // TODO: mozno pridat moznost na to aby si pouzivatel vedel vybrat ci chcem nahradit tabulku alebo pridat dalsiu (teoreticky vyuzitelne pri porovnavani)

            let tables = document.getElementsByClassName("table")
            if(tables.length === 0){
                addTable(table, `table table_${comodity_lower}`)
            }
            else{
                Swal.fire({
                    icon: "question",
                    title: "Prajete si prepísať už vygenerovanú tabuľku?",
                    showDenyButton: true,
                    denyButtonText: "Nie",
                    confirmButtonText: "Áno",
                    preConfirm: () => {
                        overwriteTable(comodity_lower, table)
                        return true
                    },
                    preDeny: () => {
                        addBasicTable(comodity_lower, table)
                        return true
                    }
                })
            }

            generation_complete = true
        }
          
    }
    else{
        validateFormForCalc()
    }
}

async function validateFormForCalc(){
    let comodity = document.getElementById("comodity").value
    let count = document.getElementById("count").value
    let unit = document.getElementById("measurement_select").value
    let date = document.getElementById("buy_date_calc").value
    let compare = document.getElementById("compare_calc").checked
    //let price = document.getElementById("buy_price_calc").value

    if(!count){
        show_error("Zadajte množstvo")
        document.getElementById("count").classList.add("invalid_input")
        return
    }    
    if(!date /* && !price */){
        show_error("Zadajte dátum nákupu")
        document.getElementById("buy_date_calc").classList.add("invalid_input")
        //document.getElementById("buy_price_calc").classList.add("invalid_input")
        return
    }
    document.getElementById("count").classList.remove("invalid_input")
    document.getElementById("buy_date_calc").classList.remove("invalid_input")
  //  document.getElementById("buy_price_calc").classList.remove("invalid_input")

    // TODO: pridat overenie datumu nesmie byt mensi ako 1.1.1979 alebo vacsi ako dnesny den

    let req_body = {
        date,
        comodity,
        count,
        unit,
        compare
    }

    req_body = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")

    let url = `./API/calcAPI.php?${req_body}`

    // overenie ci existuje v DB zaznam ceny v dany den (den do kedy by bola investicia drzana)
    const req = await fetch(url, {
        method: "GET"
    })

    if(req.status !== 200){
        show_error("Nastala chyba na strane servera. Kontaktujte admina.")
        return
    }

    const res = await req.json()


    if(!res.success){
        if(res.reason === "price_not_found"){
            show_error("Pre zadaný dátum nebola nájdená cena")
        }
        else{
            show_error("Nastala chyba na strane servera. Kontaktujte admina.")
        }
        return
    }
    addCalcTable(res)
}

function addCalcTable(data){
    let tableGen = new TableGenerator([], 0, 0)
    let tableWrapper = document.createElement("div")
    tableWrapper.setAttribute("class", `calc_table calc_table_long`)
    tableWrapper.appendChild(generateCalcTableHeader())
    let tableElement = tableGen.generateCalcTable(data.calculations)
    tableWrapper.appendChild(tableElement)
    document.getElementById("tables").appendChild(tableWrapper)
}

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
 * Function to add new table to html
 * @param {HTMLTableElement} table table to be put on page
 * @param {string} className class name for table wrapper
 * @param {mixed[]} headerParameters contains information for header component
 */
function addTable(table, className, headerParameters = []){
    let template = document.createElement("div")
    template.setAttribute("class", className)
    template.appendChild(generateTableContainerHeader(className, headerParameters))
    template.appendChild(table)
    template.appendChild(generateTableContainerFooter())
    document.getElementById("tables").insertAdjacentElement("beforeend", template)
}

/**
 * Function to create basic table
 * @param {string} comodity for which comodity is this table generated
 * @param {HTMLTableElement} table table to be put on page
 */
function addBasicTable(comodity, table){
    let tables = document.getElementsByClassName("table")
    let same_comodity_table_count = 0
    for(let i = 0; i < tables.length; i++){
        if(tables[i].getAttribute("class").includes(comodity)){
            same_comodity_table_count++
        }
    }
    
    let newClass = `table ${same_comodity_table_count <= 0 ? `table_${comodity}` : `table_${comodity}_${same_comodity_table_count}`}`

    addTable(table, newClass)

    if(tables.length >= 1){
        let cmp_btn = document.getElementById("compare")
        cmp_btn.style.display = "block"
        cmp_btn.addEventListener("click", compareTables)
    }
}

/**
 * Function to overwrite existing table
 * @param {string} comodity for which comodity is the new table generated
 * @param {HTMLTableElement} table table to be put on page
 */
async function overwriteTable(comodity,table){
    let tableToOverWriteArr = await selectTable(false)
    if(tableToOverWriteArr){
        let classToOverwrite = tableToOverWriteArr[0]
        let tableToOverwrite = document.getElementsByClassName(classToOverwrite)[0]

        let tables = document.getElementsByClassName("table")
        let count = 0
        for(let i = 0; i < tables.length; i++){
            if(tables[i].getAttribute("class").includes(comodity)){
                count++
            }
        }
        let newClass = `table ${count <= 0 ? `table_${comodity}` : `table_${comodity}_${count}`}`
        tableToOverwrite.innerHTML = ""
        tableToOverwrite.appendChild(generateTableContainerHeader(newClass))
        tableToOverwrite.appendChild(table)
        tableToOverwrite.appendChild(generateTableContainerFooter())
        tableToOverwrite.setAttribute("class", newClass)
    }
}

/**
 * Function to generate Header for table (title and remove button)
 * @param {string} tableClass class of the wrapper element
 * @param {mixed[]} extraParams contains information wheter generated table is comparison table and name for comparison table
 * @returns HTMLDivElement which is header for table, with title and remove button
 */
function generateTableContainerHeader(tableClass, extraParams = []){
    let wrapper = document.createElement("div")
    let title = ""

    let comparisonTable = false

    if(extraParams.length > 0){
        comparisonTable = extraParams[0]
    }

    let classParts = tableClass.split("_")
    let comodity = dictionary[classParts[1]]
    if(classParts.length < 3 && !comparisonTable){
        title = `Tabuľka ${comodity} (1)`
    }
    else if(comparisonTable){
        title = `Porovnanie: ${extraParams[1]}`
    }
    else{
        title = `Tabuľka ${comodity} (${Number(classParts[2]) + 1})`
    }

    let titleElement = document.createElement("p")
    titleElement.innerHTML = title
    wrapper.appendChild(titleElement)
    
    let img = document.createElement("img")
    img.src = "./imgs/cross.svg"
    img.alt = "Vymazať tabuľku"
    img.title = "Vymazať tabuľku"
    img.addEventListener("click", deleteTable)
    wrapper.appendChild(img)


    date = new Date(document.getElementById("sell_date").value)
    date = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`
    let imageTitle = ""
    if(comparisonTable){
        imageTitle = `Porovnanie tabuliek ${extraParams[1]}`
        imageTitle = imageTitle.replace(/Tabuľka/g, "")
    }
    else{
        imageTitle = `Ročná miera návratnosti ${comodity === "Zlato" ? "zlata" : "S&P 500"} (Dátum predaja: ${date})`
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
        cmp_btn.removeEventListener("click", compareTables)
        cmp_btn.style.display = "none"
    }
}

/**
 * Function to generate footer component for table
 * @returns HTMLDivElement with one button to download table
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
 * Function to compare tables
 */
async function compareTables(){
    let classes = await selectTable()
    if(classes){
        let firstTable = parseTable(document.querySelector(`.${classes[0]}`).childNodes[1])
        let secondTable = parseTable(document.querySelector(`.${classes[1]}`).childNodes[1])
        compareSelectedTables(firstTable, secondTable)
    }
}

/**
 * Function which let user chose one or multiple tables
 * @param {boolean} selectMultiple should be true if you want to let user choose two tables
 * @returns array of classes of selected tables
 */
async function selectTable(selectMultiple = true){
    let wrapper = document.getElementById("tables")
    let tables = wrapper.childNodes
    let classes = []
    let fullClasses = []
    for(let i = 0; i < tables.length; i++){
        if(tables[i].getAttribute("class").includes("comp_table")) continue
        let classParts = tables[i].getAttribute("class").split("_")
        let name = `Tabuľka ${dictionary[classParts[1]]}`
        if(classParts.length === 3)
            name = name.concat(`(${Number(classParts[2])+1})`)
        else
            name = name.concat(`(1)`)
        classes.push(name)
        fullClasses.push(tables[i].getAttribute("class"))
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

    const {value: values} = await Swal.fire({
        title: "Vyberte dve tabuľky pre porovnanie",
        html: selectMultiple ? htmlContentForTwo : htmtContent,
        allowOutsideClick: false,
        showDenyButton: true,
        denyButtonText: "Zrušiť",
        preConfirm: () => {
            if(selectMultiple){
                let val1 = document.getElementById("swal-input1").value
                let val2 = document.getElementById("swal-input2").value
                if(val1 === val2){
                    document.getElementById("swal-paragraph-error").style.display = "block"
                    return false
                }
                return[
                    val1.split(" ")[1], val2.split(" ")[1]
                ]
            }
            else{
                return [document.getElementById("swal-input1").value.split(" ")[1]]
            }
        }
    })
    if(values){
        return values
    }

}

/**
 * Function to calculate comparison table
 * @param {HTMLTableElement} table1 values in this table are considered as base values
 * @param {HTMLTableElement} table2 values in this table are substracted from base table
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
    addComparisonTable(comparisonTableValues, table1.tableTitle, table2.tableTitle, table1.fromYear, table1.toYear)

}

function checkIfCompareTableExists(table1Title, table2Title){
    let wrapper = document.getElementById("tables")
    let tables = wrapper.childNodes
    let titleToSearchFor = `Porovnanie: ${table1Title} a ${table2Title}`.replace(/&amp;/, "&")
    for(let i = 0; i < tables.length; i++){
        let tableClass = tables[i].getAttribute("class")
        if(tableClass.includes("comp_table")){
            let tableHeader = tables[i].querySelector(".table-container-header")
            let tableTitle = tableHeader.querySelector("p").innerHTML
            tableTitle = tableTitle.replace(/&amp;/, "&")
            console.log(tableTitle, titleToSearchFor)
            if(tableTitle === titleToSearchFor) return false
        }
    }
    return true
}

/**
 * Function to get all years from passed table which was already parsed
 * @param {string[]} table table to get years from
 * @returns array containing years from table
 */
function getYears(table){
    return table.map(row => row[0])
}

/**
 * Function to find if given years are the same
 * @param {number[]} table1_years years from the first table
 * @param {number[]} table2_years years from the second table
 * @returns boolean - true when all years are the same otherwise false
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
 * @param {string[]} table table to get values from
 * @returns array of numbers consisting of all values from the table parsed as numbers
 */
function getValues(table){
    return table.map((row, idx) => idx === 0 ? [] : row.map(n => Number(n.replace("%","")))).filter(row => row.length > 0)
}

/**
 * Function to substract numbers from table2 from table1
 * @param {number[]} data1 data from table1 
 * @param {number[]} data2 data from table2
 * @returns array prepared to be passed to TableGenerator
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
 */
function substractValuesForComparisonTable(value1, value2){
    return (value1 === 0 && value2 === 0) ? "" : Math.round((value1 - value2)*100)/100
}

/**
 * Function to parse table from HTML to JSON
 * @param {HTMLTableElement} table 
 * @returns Object containing data from table
 */
function parseTable(table){
    const tbody = Array.from(table.rows).map(row =>
        Array.from(row.cells).map(cell => cell.textContent),
    )

    let tableHeader = table.parentElement.querySelector(".table-container-header")
    const tableTitle = tableHeader.querySelector("p").innerHTML

    const fromYear = tbody[0][0]
    const toYear = tbody[tbody.length-1][0]
      
    return {tbody, tableTitle, fromYear, toYear}
}

/**
 * Function to add comparison table to HTML
 * @param {number[]} tableValues array containing values for table
 * @param {string} table1_name name of the first table used for comparison
 * @param {string} table2_name name of the second table used for comparison
 * @param {number} fromYear from which year should the table be generated
 * @param {number} toYear to which year should the table be generated
 */
function addComparisonTable(tableValues, table1_name, table2_name, fromYear, toYear){
    console.log(tableValues)
    let tableGen = new TableGenerator(tableValues, fromYear, toYear)
    let table = tableGen.generateTable()
    // prepocitat ktora to je a pridat to do classy just to be sure
    let newClass = `table comp_table`

    addTable(table, newClass, [true, `${table1_name} a ${table2_name}`])
}

/**
 * Function to validate years from user input
 * @returns Object representing the result of the checks
 */
function check_years_input(){
    let from_year_el = document.getElementById("from_year") 
    let from_year = from_year_el.value
    let to_year_el = document.getElementById("to_year")
    let to_year = to_year_el.value

    let res = {
        data_missing: false,
        valid_order: false,
        to_year,
        from_year
    }

    if(!from_year || !to_year){
        res.data_missing = true
        if(!from_year){
            from_year_el.setAttribute("class", "invalid_input")
        }
        else{
            from_year_el.setAttribute("class", "")
        }
        if(!to_year){
            to_year_el.setAttribute("class", "invalid_input")
        }
        else{
            to_year_el.setAttribute("class", "")
        }
        return res
    }
    else{
        to_year_el.setAttribute("class", "")    
        from_year_el.setAttribute("class", "")
    }

    if(Number(from_year) <= Number(to_year)){
        res.valid_order = true
    }

    return res
}

/**
 * Function to fire Swal with error icon
 * @param {string} message string to be shown as error message
 */
function show_error(message){
    Swal.fire({
        title: "Error !",
        icon: 'error',
        text: `${message}`,
        showCloseButton: true,
        confirmButtonColor: "#1e90ff"
    })
}

/**
 * Function to fire Swal with info icon
 * @param {string} message string to be shown as info message
 */
function show_info(message){
    Swal.fire({
        title: "Neplatný údaj",
        icon: 'info',
        text: `${message}`,
        showCloseButton: true,
        confirmButtonColor: "#1e90ff"
    })
}

/**
 * Function to download table using HTML2Canvas library, this function triggers download pop-up
 */
function download_table(){
    let wrapper = this.parentElement.parentElement
    let title = wrapper.querySelector("#image_title").innerHTML
    title = title.replace("&amp;", "&")
    html2canvas(wrapper.querySelector("table"))
        .then(canvas => {
            let newCanvas = document.createElement("canvas")
            let context = newCanvas.getContext("2d")

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
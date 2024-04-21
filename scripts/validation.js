//@ts-check

/**
 * @namespace Validation
 */

let form = (/** @type {HTMLFormElement}*/(document.querySelector('form')))
form.addEventListener('submit', e => {
    e.preventDefault()
    validateForm()
})


/**
 * Function to validate form and generate new table.
 * At first this function checks type of table user wants to generate based on input with "table_type" id.
 * If selected type is for investment calculator then {@link Validation.validateFormForCalc} function is called.
 * Otherwise it calls {@link Validation.check_years_input} function, if everything is alright then API request is send to retrieve data for table.
 * Then new instance of {@link Tables.TableGenerator} class is created and {@link Tables.TableGenerator.generateTable} is called.
 * If there already is a generated table user is prompted if he wants to add new table or overwrite existing one. Based on response {@link Tables.addBasicTable} or {@link Tables.overwriteTable} is called.
 * If this is first table to be added than {@link Tables.addTable} is called. 
 * @returns null
 * @memberof Validation
 */
async function validateForm(){
    let radio_buttons = document.getElementsByName("table_type")
    let table_type = (/** @type {HTMLInputElement}*/(radio_buttons[0])).checked ? (/** @type {HTMLInputElement}*/(radio_buttons[0])).value : (/** @type {HTMLInputElement}*/(radio_buttons[1])).value
    if(table_type === "AP"){
        // overenie spravnosti zadanych rokov
        let years_check = check_years_input();

        if(years_check.error_msg !== ""){
            show_error(years_check.error_msg)
            return false
        }

        if(!years_check.data_missing && !years_check.valid_order){
            show_error("Začiatočný rok nemôže byť väčší ako konečný rok")
            return false
        }

        let date_el = (/** @type {HTMLInputElement}*/(document.getElementById("sell_date")))
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

        let end_type = validate_end_type()
        if(!end_type) return;

        if(!end_type.success){
            (/** @type {HTMLInputElement}*/(document.getElementById("custom_day_calc_input"))).setAttribute("class", "invalid_input active")
            return false
        }        
        else if(end_type.type === "day"){
            (/** @type {HTMLInputElement}*/(document.getElementById("custom_day_calc_input"))).setAttribute("class", "active")
        }

        let currency = (/** @type {HTMLInputElement}*/(document.getElementById("currency"))).value

        let comodity = (/** @type {HTMLInputElement}*/(document.getElementById("comodity"))).value


        let req_body = {
            date,
            currency,
            comodity
        }

        let req_body_str = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")

        let url = `./API/get_price_by_date.php?${req_body_str}`
        // overenie ci existuje v DB zaznam ceny v dany den (den do kedy by bola investicia drzana)
        const res = await fetch(url, {
            method: "GET",
        })

        if(res.status !== 200){
            show_error("Chyba pri získavaní dát");    
            return false
        }

        const validDate = await res.json()

        let sellMargin = (/** @type {HTMLInputElement}*/(document.getElementById("sell_margin"))).value
        let buyMargin = (/** @type {HTMLInputElement}*/(document.getElementById("buy_margin"))).value

        if(!validDate.success){
            if(validDate.nearestDateFound){
                let nearestDate = new Date(validDate.nearestDate).toLocaleDateString()
                show_info(`Nebolo možné získať cenu z dátumu predaja. Najbližší dátum s platným záznamom: ${nearestDate}`)    
            }
            else{
                show_info("Nebolo možné získať cenu z dátumu predaja. Zvoľte iný dátum")
            }
            return false
        }
        else{
            let req_body = {
                to_year: years_check.to_year,
                from_year: years_check.from_year,
                sell_date: date,
                currency,
                table_type: "AP",
                sell_margin: sellMargin,
                buy_margin: buyMargin,
                comodity,
                type: end_type.type
            }
            if(end_type.type === "day"){
                req_body["day_num"] = end_type.value
            }

            let req_body_str = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")

            let spinner_backdrop = (/** @type {HTMLDivElement}*/(document.getElementById("spinner-backdrop")))

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

            let url = `./API/TableAPI.php?${req_body_str}`
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
            let tableGen = new TableGenerator(res,  Number(years_check.from_year), Number(years_check.to_year))
            let table = tableGen.generateTable();

            let comodity_lower = comodity.toLowerCase()

            // pridanie tabulky alebo nahradenie uz existujucej tabulky
            // TODO: mozno pridat moznost na to aby si pouzivatel vedel vybrat ci chcem nahradit tabulku alebo pridat dalsiu (teoreticky vyuzitelne pri porovnavani)

            let tables = document.getElementsByClassName("table")
            if(tables.length === 0){
                addTable(table, `table table_${comodity_lower}`)
            }
            else{
                //@ts-ignore
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

/**
 * Function to validate form for investment calculator. Makes an API call. In the end {@link Tables.addCalcTable} is called.
 * @function validateFormForCalc
 * @memberof Validation
 */
async function validateFormForCalc(){
    let comodity = (/** @type {HTMLSelectElement}*/(document.getElementById("comodity"))).value
    let count = (/** @type {HTMLInputElement}*/(document.getElementById("count"))).value
    let unit = (/** @type {HTMLSelectElement}*/(document.getElementById("measurement_select"))).value
    let date = (/** @type {HTMLInputElement}*/(document.getElementById("buy_date_calc"))).value
    let compare = (/** @type {HTMLInputElement}*/(document.getElementById("compare_calc"))).checked
    let currency = (/** @type {HTMLSelectElement}*/(document.getElementById("currency"))).value

    if(!count){
        show_error("Zadajte množstvo");
        (/** @type {HTMLInputElement}*/(document.getElementById("count"))).classList.add("invalid_input")
        return
    }    
    if(!date){
        show_error("Zadajte dátum nákupu");
        (/** @type {HTMLInputElement}*/(document.getElementById("buy_date_calc"))).classList.add("invalid_input")
        return
    }
    (/** @type {HTMLInputElement}*/(document.getElementById("count"))).classList.remove("invalid_input");
    (/** @type {HTMLInputElement}*/(document.getElementById("buy_date_calc"))).classList.remove("invalid_input");

    // TODO: pridat overenie datumu nesmie byt mensi ako 1.1.1979 alebo vacsi ako dnesny den
    let dt = new Date(date)
    let fullYear = dt.getFullYear()
    let month = dt.getMonth()+1
    let day = dt.getDate()
    if(currency === "1"){
        if(fullYear < 1979 || fullYear > new Date().getFullYear()){
            show_error("Rok predaja nemôže byť menší ako 1979 a zároveň nemôže byť väčší ako aktuálny rok")
            return
        }
    }
    else{
        if(fullYear < 1999|| fullYear > new Date().getFullYear()){
            show_error("Rok predaja nemôže byť menší ako 1999 a zároveň nemôže byť väčší ako aktuálny rok")
            return
        }
    }

    let req_body = {
        date,
        comodity,
        count,
        unit,
        compare,
        currency
    }

    let req_body_str = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")

    let url = `./API/calcAPI.php?${req_body_str}`

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
    let currencySign = currency === "1" ? "$" : "€"
    addCalcTable(res, currencySign);
}

/**
 * Function to validate years from user input
 * @function check_years_input
 * @returns Object representing the result of the checks
 * @memberof Validation
 */
function check_years_input(){
    let from_year_el = (/** @type {HTMLInputElement}*/(document.getElementById("from_year")))
    let from_year = from_year_el.value
    let to_year_el = (/** @type {HTMLInputElement}*/(document.getElementById("to_year")))
    let to_year = to_year_el.value

    let currency = (/** @type {HTMLSelectElement}*/(document.getElementById("currency"))).value
    let comodity = (/** @type {HTMLSelectElement}*/(document.getElementById("comodity"))).value

    let res = {
        data_missing: false,
        valid_order: false,
        to_year,
        from_year,
        error_msg: ""
    }

    if(currency === "2"){ // check EUR constraints
        if(comodity === "sp500"){
            if(Number(from_year) < 1999 || Number(to_year) < 1999){
                res.error_msg = "S&P500 v € má dáta od 4.1.1999"
                return res
            }
        }
        else if(comodity === "Gold"){
            if(Number(from_year) < 1999 || Number(to_year) < 1999){
                res.error_msg = "Zlato v € má dáta od 2.1.1999"
                return res
            }
        }
        else{
            if(Number(from_year) < 1999 || Number(to_year) < 1999){
                res.error_msg = "Striebro v € má dáta od 4.1.1999"
                return res
            }
        }
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
 * Function to validate selected end type
 * @returns object representing results of the checks
 * @memberof Validation
 */
function validate_end_type(){
    let buttons = document.getElementsByName("day_calc")
    for(let i = 0; i < buttons.length; i++){
        let btn = (/** @type {HTMLInputElement}*/(buttons[i]))
        if(btn.checked){
            if(btn.value == "custom_day"){
                let number = Number((/** @type {HTMLInputElement}*/(document.getElementById("custom_day_calc_input"))).value)
                if(!number || number > 31 || number <= 0){
                    let msg = !number ? "Doplňte chýbajúce údaje" : "Zadajte čislo medzi 1 a 31"
                    show_error(msg)
                    return {success: false}
                }
                return {success: true, type: "day", value: number}
            }
            else{
                return {success: true, type: btn.value}
            }
        }
    }
}

/**
 * Function to fire Swal with error icon
 * @param {string} message string to be shown as error message
 */
function show_error(message){
    //@ts-ignore
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
    //@ts-ignore
    Swal.fire({
        title: "Neplatný údaj",
        icon: 'info',
        text: `${message}`,
        showCloseButton: true,
        confirmButtonColor: "#1e90ff"
    })
}
//@ts-check

let util = (/** @type {HTMLInputElement}*/(document.getElementById("AP"))).checked ? "table" : "calc"

/** 
 * Returns number of tables generated that are visible on the page.
 * @return {Number} 
 */
const get_table_count = () => document.getElementsByClassName("table").length

/**
 * Resets comodity selector to default value. In this case default value is "Gold".
 * @returns {void}
 */
const reset_comodity_pick = () => {(/** @type {HTMLSelectElement}*/(document.getElementById("comodity"))).value = "Gold"};


(/** @type {HTMLElement}*/(document.getElementById("radio-buttons"))).addEventListener("change", (e) => {
    let table_only = document.getElementsByClassName("table_only")
    let calc_only = document.getElementsByClassName("calc_only")
    let tables = document.getElementsByClassName("table")
    let calcTables = document.getElementsByClassName("calc_table")
    let compare_button = (/** @type {HTMLButtonElement}*/(document.getElementById("compare")))

    let target = e.target
    if(target === null){return;}

    if((/** @type {HTMLButtonElement}*/(target)).value === "AP"){
        util = "table"
        for(let i = 0; i < table_only.length; i++){
            table_only[i].classList.remove("disabled")
            table_only[i].classList.add("active")
        }
        for(let i = 0; i < calc_only.length; i++){
            calc_only[i].classList.remove("active")
            calc_only[i].classList.add("disabled")
        }
        for(let i = 0; i < tables.length; i++){
            (/** @type {HTMLTableElement}*/(tables[i])).style.display = "block"
        }
        for(let i = 0; i < calcTables.length; i++){
            (/** @type {HTMLTableElement}*/(calcTables[i])).style.display = "none"
        }
        if(get_table_count() >= 2) compare_button.style.display = "block"

    }
    else{
        util = "calc"
        for(let i = 0; i < table_only.length; i++){
            table_only[i].classList.remove("active")
            table_only[i].classList.add("disabled")
        }
        for(let i = 0; i < calc_only.length; i++){
            calc_only[i].classList.remove("disabled")
            calc_only[i].classList.add("active")
        }
        for(let i = 0; i < tables.length; i++){
            (/** @type {HTMLTableElement}*/(tables[i])).style.display = "none"
        }
        for(let i = 0; i < calcTables.length; i++){
            (/** @type {HTMLTableElement}*/(calcTables[i])).style.display = "block"
        }
        compare_button.style.display = "none"
    }
    reset_comodity_pick()
});

(/** @type {HTMLSelectElement}*/(document.getElementById("comodity"))).addEventListener("change", (e) => {
    let measurementSelect = (/** @type {HTMLSelectElement}*/(document.getElementById("measurement")))
 //   let buyPriceLabel = document.getElementById("buy_price_label")
    let unit = (/** @type {HTMLSelectElement}*/(document.getElementById("measurement_select"))).value
    if(util === "calc"){
        let target = e.target
        if(target === null){return;}
        
        if((/** @type {HTMLSelectElement}*/(target)).value === "sp500"){
            measurementSelect.classList.add("disabled")
            measurementSelect.classList.remove("active")
   //         buyPriceLabel.innerHTML = "Cena za jednu akciu:"
        }
        else{
            measurementSelect.classList.add("active")
            measurementSelect.classList.remove("disabled")
  //          buyPriceLabel.innerHTML = `Cena za ${unit === "oz" ? "jednu uncu:" : "jeden gram:"}`

        }
    }
});

(/** @type {HTMLFieldSetElement}*/(document.getElementById("end_type"))).addEventListener("change", (e) => {
    // @ts-ignore
    let explicitTargetId = e.explicitOriginalTarget.id
    // kontrola ci to kde pouzivatel klikol je jeden z radio buttons, bez tejto podmienky ked pouzivatel zadava konkretny den a klikne niekde mimo input fieldu tak ten input field zmizne
    if(explicitTargetId != "custom_day_calc" && explicitTargetId != "day_calc_month" && explicitTargetId != "day_calc"){
        return
    }
    let target = e.target
    if(target === null){return;}

    let value = (/** @type {HTMLSelectElement}*/(target)).value

    let inputEl = (/** @type {HTMLInputElement}*/(document.getElementById("custom_day_calc_input")))

    if(value != "custom_day"){
        inputEl.classList.remove("active")
        inputEl.classList.add("disable")
    }
    else{
        inputEl.classList.remove("disable")
        inputEl.classList.add("active")
    }
});

/** Initial pop-up */
// @ts-ignore
Swal.fire({
    icon: "info",
    text: "Pri zadávaní marže, zadávajte kladnú hodnotu ak ide o poplatok na burze, ak kupujte pod cenou na burze, zadajte záporné čislo"
});

/** pop-up when clicked on info icon next to currency picker */
(/** @type {HTMLImageElement}*/(document.getElementById("tooltip_clickable_currency"))).addEventListener("click", () => {
    //@ts-ignore
    Swal.fire({
        icon: "info",
        html: `<p>Pre dolár sú dáta získavané z YahooFinanceAPI.</p><br><p>Pre eurá sú ceny zlata a striebra z GoldApi.</p><br>Ceny S&P500 v € sú prepočítavané na základe kurzu.`
    })
});
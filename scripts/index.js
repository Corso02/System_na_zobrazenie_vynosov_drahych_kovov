let util = document.getElementById("AP").checked ? "table" : "calc"

const get_table_count = () => document.getElementsByClassName("table").length

const reset_comodity_pick = () => document.getElementById("comodity").value = "Gold"

document.getElementById("radio-buttons").addEventListener("change", (e) => {
    let table_only = document.getElementsByClassName("table_only")
    let calc_only = document.getElementsByClassName("calc_only")
    let tables = document.getElementsByClassName("table")
    let calcTables = document.getElementsByClassName("calc_table")
    let compare_button = document.getElementById("compare")
    if(e.target.defaultValue === "AP"){
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
            tables[i].style.display = "block"
        }
        for(let i = 0; i < calcTables.length; i++){
            calcTables[i].style.display = "none"
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
            tables[i].style.display = "none"
        }
        for(let i = 0; i < calcTables.length; i++){
            calcTables[i].style.display = "block"
        }
        compare_button.style.display = "none"
    }
    reset_comodity_pick()
})

document.getElementById("comodity").addEventListener("change", (e) => {
    let measurementSelect = document.getElementById("measurement")
 //   let buyPriceLabel = document.getElementById("buy_price_label")
    let unit = document.getElementById("measurement_select").value
    if(util === "calc"){
        if(e.target.value === "sp500"){
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
})

/* document.getElementById("measurement_select").addEventListener("change", (e) => {
    let buyPriceLabel = document.getElementById("buy_price_label")
    buyPriceLabel.innerHTML = `Cena za ${e.target.value === "oz" ? "jednu uncu:" : "jeden gram:"}`
})
 */


Swal.fire({
    icon: "info",
    text: "Pri zadávaní marže, zadávajte kladnú hodnotu ak ide o poplatok na burze, ak kupujte pod cenou na burze, zadajte záporné čislo"
})

/* async function get_last_update_date(){
    let res = await fetch("./API/get_last_update_date.php")
    let json = await res.json()

    let date = new Date(json)
    console.log(date)
    let dateStr = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`
    let msg = `Posledná aktualizácia cien: ${dateStr}`
    let txtEle = document.createElement("p")
    txtEle.innerHTML = msg
    document.getElementsByClassName("last_update_date_wrapper")[0].appendChild(txtEle)
}

async function check_update(){
    await fetch("./API/check_update.php")
    get_last_update_date()
}
check_update() */
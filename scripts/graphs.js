let verticalLineVisible = false;
let verticalLineX = 0;
let myChart
let showVerticalLine = false; // Nastavte na true, keď chcete zobraziť čiaru

let graph_labels = {
    "30_dni": "Posledných 30 dní",
    "60_dni": "Posledných 60 dní",
    "3_mesiace": "Posledné 3 mesiace",
    "6_mesiacov": "Posledných 6 mesiacov",
    "posledny_rok": "Posledný rok",
    "posledne_2_roky": "Posledné 2 roky",
    "poslednych_5_rokov": "Posledných 5 rokov",
    "poslednych_10_rokov": "Posledných 10 rokov",
    "vsetky_data": "Všetky dáta"
}

const comodity_to_title = {
    "Gold": "zlata",
    "sp500": "S&P 500",
    "Silver": "striebra"
}

const dict = {
    "Gold": "Zlato",
    "sp500": "S&P 500",
    "Silver": "Striebro"
}

let comodites_for_selection = {
    "Gold": "Zlato",
    "S&P500": "S&P 500",
    "Silver": "Striebro"
}


let comodities_in_graph = [
    getComodity()
]

let colors = ["rgba(75, 192, 192, 1)", "rgba(42, 75, 192, 1)", "rgba(192, 42, 75, 1)"]

// pole kde budem mat ulozene referencie na staticke grafy, aby som ich vedel znicit, resetovat atd
let static_graphs = {}

function selection_update_handler(){
    let selected_value = getGraphSize()
    let today = new Date()
    let start = getStartDate()
    let comodity = getComodity()
    if(selected_value != "custom")
        create_graph(start, today, comodity, graph_labels[selected_value])
}

function getGraphType(){
    return document.getElementById("graph_type").value
}

function getStartDate(graphSize = null){
    let graph_size = graphSize ? graphSize : getGraphSize()
    let start = new Date()
    switch(graph_size){
        case "30_dni":
            start.setDate(start.getDate() - 30)
            break
        case "60_dni":
            start.setDate(start.getDate() - 60)
            break
        case "3_mesiace":
            start.setMonth(start.getMonth() - 3)
            break
        case "6_mesiacov":
            start.setMonth(start.getMonth() - 6)
            break
        case "posledny_rok":
            start.setFullYear(start.getFullYear() - 1)
            break
        case "posledne_2_roky":
            start.setFullYear(start.getFullYear() - 2)
            break
        case "poslednych_5_rokov":
            start.setFullYear(start.getFullYear() - 5)
            break
        case "poslednych_10_rokov":
            start.setFullYear(start.getFullYear() - 10)
            break
        case "vsetky_data":
            start = new Date("1979-01-01")
            break
        default: break
    }
    return start
}

function getGraphSize(){
    return  document.getElementById("graph_selection").value
}

function getComodity(){
    let comodity = document.getElementById("comodity_selection").value
    if(comodity === "S&P500")
        comodity = "sp500"
    return comodity
}

function getAllComodities(){
    let selectEl = document.getElementById("comodity_selection")
    let res = []
    for(let i = 0; i < selectEl.childNodes.length; i++){
        let comodity = selectEl.childNodes[i].value
        if(comodity){
            if(comodity === "S&P500")
                comodity = "sp500"
            res.push(comodity)
        }
    }
   return res
}

function normalize_date_for_graph(dateStr){
    date = new Date(dateStr)
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()

    return `${day}.${month}.${year}`
}

function create_line_graph(data, labels, label, id, dynamic){

    const zoomOptions = {
        zoom: {
            wheel: {
                enabled: true,
            },
            pinch: {
                enabled: true,
            },
            mode: 'xy',
        },
        pan: {
            enabled: true,
            mode: 'xy',
        },
      };

    let ctx = document.getElementById(id).getContext("2d")
    if(myChart && dynamic)
        myChart.destroy()
    // Vytvorte nový graf typu 'line'
    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, // X
            datasets: [{
                label,
                data: data, // Y
                borderColor: 'rgba(75, 192, 192, 1)', 
                borderWidth: 2 
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false, 
            elements: {
                point:{
                    hitRadius: 5,
                    radius: 0
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks:{
                       callback: function(value, idx, values) { 
                            if(idx === 0 || idx === values.length - 1){
                                return this.getLabelForValue(value)
                            }
                       },
                       maxRotation: 0
                    } 
                },
                y: {
                    grid: {
                        display: false
                    },
                },  
            },
            plugins: {
                zoom: zoomOptions,
                tooltip: {
                    enabled: true,
                },
              
            },
        }
    });

    if(dynamic){
        myChart = chart
        document.getElementById("reset_zoom").addEventListener("click", () => {
            myChart.resetZoom()
        })
    }
    else
        static_graphs[id] = chart
}

async function create_graph_of_year_month(){
    let year = document.getElementById("graph_year").value
    let month = document.getElementById("graph_month").value
    let currency = 1
    let type = "month_year"

    console.log(`ziskavam udaje pre rok ${year} a mesiac ${month}`)

    let req_body = {
        year,
        month,
        currency,
        type
    }

    req_body = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")

    let url =  `./API/GraphDataAPI.php?${req_body}`

    let api_res = await fetch(url, {
        method: "GET"
    })

    api_res = await api_res.json()

    let prices = api_res.map(data => data[0])
    let labels = api_res.map(data => data[1])

    let graph_label = `Cena zlata: ${month}. mesiac , rok ${year}`

    create_line_graph(prices, labels, graph_label)
   
}

function normalize_date_for_db(date){
    day = `${date.getDate()}`
    month = `${date.getMonth() + 1}`
    year = `${date.getFullYear()}`

    if(day.length === 1){
        day = `0${day}`
    }
    if(month.length === 1){
        month = `0${month}`
    }
    return `${year}-${month}-${day}`
}

async function create_graph(start, end, comodity, label, dynamic = true, id = "my_chart"){
    let end_date = normalize_date_for_db(end)
    let start_date = normalize_date_for_db(start)

    let currency = 1
   
    let req_body = {
        end_date,
        start_date,
        currency,
        comodity,
        graph_type: "price_graph"
    }

    req_body = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")
    let url = `./API/GraphDataAPI.php?${req_body}`
    let res = await fetch(url, {
        method: "GET"
    })
    .catch(err => console.log(err))

    let data = await res.json()
            .catch(err => console.log(err)) 

    let prices = data.map(d => d[0])
    let dates = data.map(d => d[1]).map(normalize_date_for_graph)

    graph_label = `Cena ${comodity_to_title[comodity]}: ${label}`

    create_line_graph(prices, dates, graph_label, id, dynamic)
}

function download_graph(dynamic = true, id = ""){
    let graf = dynamic ? myChart : static_graphs[id]
    let canvasUrl = graf.toBase64Image()
    let canvasLabel = graf.config._config.data.datasets[0].label
    const createEl = document.createElement("a")
    createEl.href = canvasUrl
    createEl.download = `Graf_${canvasLabel.split(":")[1].slice(1)}`
    createEl.click()
    createEl.remove()
}

async function chose_comodity_to_add(){
    
    let allComodities = getAllComodities()

    let options = ""
    for(let i = 0; i < allComodities.length; i++){
        options = options.concat(`<option value='${allComodities[i]}'>${dict[allComodities[i]]}</option>`)
    }

    let sizeOptions = ""
    let selection_values = Object.keys(graph_labels)
    let selection_text = Object.values(graph_labels)
    for(let i = 0; i < selection_text.length; i++){
        sizeOptions = sizeOptions.concat(`<option value='${selection_values[i]}'>${selection_text[i]}</option>`)
    }

    
    let htmlContent = `
        <select class="swal2-select" id="comodity_to_add_select">
            ${options}
        </select>
        <select class="swal2-select" id="comodity_to_add_size">
            ${sizeOptions}
        </select>
    `
    const {value: comodity_to_add } = await Swal.fire({
        icon: "question",
        title: "Vyberte ktoré aktívum chcete pridať.",
        html: htmlContent,
        preConfirm: () => [document.getElementById("comodity_to_add_select").value, document.getElementById("comodity_to_add_size").value]
        
    })
    if(comodity_to_add){
        return comodity_to_add
    }
}

async function add_new_graph(){
    let graph_to_add = await chose_comodity_to_add()
    if(graph_to_add){
        console.log(graph_to_add)
        let comodity = graph_to_add[0]
        let size = graph_to_add[1]

        generate_graph_container(comodity, size)
    }
    
}

function generate_graph_container(comodity, size){
    
    let wrapper = document.createElement("div")
    let allContainers = document.querySelectorAll("[class^=graph_]")
    // class name: 'graph_wrapper graph_<graphNum>', split by space to get second class, then split by _ to get number 
    let lastGraphNum = Number(allContainers[allContainers.length - 1].getAttribute("class").split(" ")[1].split("_")[1])
    let newClass = `graph_wrapper graph_${lastGraphNum+1}`
    wrapper.setAttribute("class", newClass)

    generate_graph_header(wrapper)
    generate_static_graph(wrapper, `my_chart_${lastGraphNum+1}`)
    
    allContainers[allContainers.length-1].insertAdjacentElement("afterend", wrapper)
  
    let today = new Date()
    let start = getStartDate(size)
    create_graph(start, today, comodity, graph_labels[size], false, `my_chart_${lastGraphNum+1}`)
    generate_graph_footer(wrapper, `my_chart_${lastGraphNum+1}`)
}

function generate_graph_header(parentElement){

    let wrapper = document.createElement("div")
    wrapper.setAttribute("class", "chart_header")

    /* let selection_label = document.createElement("label")
    selection_label.innerHTML = "Obdobie"
    wrapper.appendChild(selection_label)

    let selection_values = Object.keys(graph_labels)
    let selection_text = Object.values(graph_labels)
    let selectEl = document.createElement("select")
    for(let i = 0; i < selection_text.length; i++){
        let option = document.createElement("option")    
        option.value = selection_values[i]
        option.innerHTML = selection_text[i]
        selectEl.appendChild(option)
    }

    wrapper.appendChild(selectEl)

    let comodity_label = document.createElement("label")
    comodity_label.innerHTML = "Komodita"
    wrapper.appendChild(comodity_label)

    selection_values = Object.keys(comodites_for_selection)
    selection_text = Object.values(comodites_for_selection)
    let comodity_selection = document.createElement("select")

    for(let i = 0; i < selection_text.length; i++){
        let option = document.createElement("option")
        option.value = selection_values[i]
        option.innerHTML = selection_text[i]
        comodity_selection.appendChild(option)
    }

    wrapper.appendChild(comodity_selection) */

    let close_img = document.createElement("img")
    close_img.alt = "Vymazať graf"
    close_img.src = "./imgs/cross.svg"
    close_img.addEventListener("click", delete_graph)

    wrapper.appendChild(close_img)

    parentElement.appendChild(wrapper)

}

function generate_static_graph(parentElement, canvas_id){
    let canvas = document.createElement("canvas")
    canvas.width = 800
    canvas.height = 400
    canvas.setAttribute("id", canvas_id)
    parentElement.appendChild(canvas)

}

function generate_graph_footer(parenElement, id){
    let wrapper = document.createElement("div")
    wrapper.setAttribute("class", "chart_footer")

    let resetBtn = document.createElement("button")
    resetBtn.setAttribute("id", `reset_zoom_${id}`)
    resetBtn.setAttribute("class", "btn")
    resetBtn.innerHTML = "Vycentruj graf"
    resetBtn.addEventListener("click", () => static_graphs[id].resetZoom())

    let download_btn = document.createElement("button")
    download_btn.setAttribute("id", `graph_download_button_${id}`)
    download_btn.setAttribute("class", "btn")
    download_btn.innerHTML = "Stiahnúť graf"
    download_btn.addEventListener("click", () => download_graph(false, id))

    wrapper.appendChild(resetBtn)
    wrapper.appendChild(download_btn)
    parenElement.appendChild(wrapper)
}

function delete_graph(element){
    let wrapper = element.target.parentElement.parentElement
    let canvas = wrapper.querySelector("canvas")
    let canvas_id = canvas.getAttribute("id")
    static_graphs[canvas_id].destroy()
    wrapper.innerHtml = ""
    wrapper.remove()
}

function handle_graph_selection_handler_price(e){
    let value = e.target.value
    if(value === 'custom'){
        let elements = document.getElementsByClassName("custom")
        for(let i = 0; i < elements.length; i++){
            elements[i].style.display = "block"
        }
    }
    else{
        let elements = document.getElementsByClassName("custom")
        for(let i = 0; i < elements.length; i++){
            elements[i].style.display = "none"
        }
    }
    selection_update_handler(value)
}

function handle_graph_selection_handler_crc(){
    let graphSize = getGraphSize()
    create_crc_graph(graphSize)
}

async function create_crc_graph(graphSize){

    let req_body = {
        graph_selection: graphSize
    }

    req_body = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")
    let url = `./API/GraphDataAPI.php?${req_body}`
    let res = await fetch(url, {
        method: "GET"
    })
    .catch(err => console.log(err))

    let data = await res.json()
            .catch(err => console.log(err)) 
    
    let dates = data[0][1].map(d => normalize_date_for_graph(d[0]))

    let datasets = []
    for(let i = 0; i < data.length; i++){
        datasets.push(create_data_set(data[i], i))
    }    

    console.log(data)

    create_CRC_graph(datasets, dates)
    
}

function create_data_set(dataToProcess, dataSetId){
    let label = dataToProcess[0]
    let prices = dataToProcess[1].map(a => a[1]) 
    let color = colors[dataSetId]
    return {
        label, data:prices, borderColor: color, borderWidth: 2
    }
}

function create_CRC_graph(datasets, labels){
    const zoomOptions = {
        zoom: {
            wheel: {
                enabled: true,
            },
            pinch: {
                enabled: true,
            },
            mode: 'xy',
        },
        pan: {
            enabled: true,
            mode: 'xy',
        },
      };

    let ctx = document.getElementById("my_chart").getContext("2d")
    if(myChart)
        myChart.destroy()
    // Vytvorte nový graf typu 'line'
    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: false,
            maintainAspectRatio: false, 
            elements: {
                point:{
                    hitRadius: 5,
                    radius: 0
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks:{
                       callback: function(value, idx, values) { 
                            if(idx === 0 || idx === values.length - 1){
                                return this.getLabelForValue(value)
                            }
                       },
                       maxRotation: 0
                    } 
                },
                y: {
                    grid: {
                        display: false
                    },
                },  
            },
            plugins: {
                zoom: zoomOptions,
                tooltip: {
                    enabled: true,
                },
              
            },
        }
    });

    
    myChart = chart
    document.getElementById("reset_zoom").addEventListener("click", () => {
        myChart.resetZoom()
    })
}

function change_graph_type(){
    let graph_type = getGraphType()
    let price_elements = document.getElementsByClassName("price")
    let crc_elements = document.getElementsByClassName("crc")
    for(let i = 0; i < price_elements.length; i++){
            price_elements[i].classList.toggle("active")
            price_elements[i].classList.toggle("disabled")
    }

    for(let i = 0; i < crc_elements.length; i++){
            crc_elements[i].classList.toggle("active")
            crc_elements[i].classList.toggle("disabled")
    }
    if(graph_type === "price_graph"){
        let end = new Date()
        let start = new Date()
        start.setMonth(start.getMonth() - 3)
        document.getElementById("graph_selection").value = "3_mesiace"
        document.getElementById("graph_selection").removeEventListener("change", handle_graph_selection_handler_crc)
        document.getElementById("graph_selection").addEventListener("change", handle_graph_selection_handler_price)
        document.getElementById("comodity_selection").value = "Gold"
        create_graph(start, end, "Gold", graph_labels['3_mesiace'])        
    }
    else{
        document.getElementById("graph_selection").addEventListener("change", handle_graph_selection_handler_crc)
        document.getElementById("graph_selection").removeEventListener("change", handle_graph_selection_handler_price)
    }
}


let end = new Date() // today
let start = new Date() // 3 months ago
start.setMonth(start.getMonth() - 3)
let com = getComodity()
create_graph(start, end, com, graph_labels['3_mesiace'])
document.getElementById("graph_download_button").addEventListener("click", download_graph)

let selection = document.querySelector("#graph_selection")
selection.addEventListener("change", handle_graph_selection_handler_price)

document.getElementById("comodity_selection").addEventListener("change", selection_update_handler)

document.getElementById("add_comodity_btn").addEventListener("click", add_new_graph)

//document.getElementById("graph_type").addEventListener("change", change_graph_type)
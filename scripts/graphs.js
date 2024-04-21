//@ts-check

/**
 *  All methods in this namespace are used when user is working with graphs. ChartJS library was used to generate new graphs. There are defined methods for CRCs (Cumulative return charts) that are not used in production.
 *  These methods were created when I tried to plot multiple comodities in one graph, but there is some tweaking needed. 
 *  @namespace Graphs
 * 
 */

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
};


// used for CRC graphs
let colors = ["rgba(75, 192, 192, 1)", "rgba(42, 75, 192, 1)", "rgba(192, 42, 75, 1)"];

// holds references for static graphs, this way its possible to destroy or reset them
let static_graphs = {};

/**
 * Handler when user changes one of the inputs.
 * This function will re-generate dynamic graph, using create_graph function.
 * {@link Graphs.create_graph}
 * @function selection_update_handler
 * @memberof Graphs
 */
function selection_update_handler(){
    let selected_value = getGraphSize()
    let today = new Date()
    let start = getStartDate()
    let comodity = getComodity()
    if(selected_value != "custom"){
        create_graph(start, today, comodity, graph_labels[selected_value]);
    }
}

/**
 * Function to get selected graph type. Can be used when we want to have multiple graph types. In that case selected graph type is retrieved from element with id "graph_type".
 * @deprecated - only one graph type is supported right now
 * @returns {string} - retazec
 * @memberof Graphs
 */
function getGraphType(){
    let el = /** @type {HTMLSelectElement}*/(document.getElementById("graph_type"))
    return el.value
}
/**
 * Function to get start date based on selected value. 
 * @function getStartDate
 * @param {string | null} graphSize - value from select element, if not provided {@link Graphs.getGraphSize} is used.
 * @returns {Date}
 * @memberof Graphs
 */
function getStartDate(graphSize = null){
    let graph_size = graphSize ? graphSize : getGraphSize()
    let start = new Date()
    switch(graph_size){
        case "30_dni":
            start.setDate(start.getDate() - 30)
            break;
        case "60_dni":
            start.setDate(start.getDate() - 60)
            break;
        case "3_mesiace":
            start.setMonth(start.getMonth() - 3)
            break;
        case "6_mesiacov":
            start.setMonth(start.getMonth() - 6)
            break;
        case "posledny_rok":
            start.setFullYear(start.getFullYear() - 1)
            break;
        case "posledne_2_roky":
            start.setFullYear(start.getFullYear() - 2)
            break;
        case "poslednych_5_rokov":
            start.setFullYear(start.getFullYear() - 5)
            break;
        case "poslednych_10_rokov":
            start.setFullYear(start.getFullYear() - 10)
            break;
        case "vsetky_data":
            start = new Date("1979-01-01")
            break;
        default: break;
    }
    return start
}

/**
 * Function to retrieve graph size from input with "graph_selection" id. 
 * @function getGraphSize
 * @returns {string}
 * @memberof Graphs
 */
function getGraphSize(){
    let el = /** @type {HTMLSelectElement} */ (document.getElementById("graph_selection"))
    return el.value
}

/**
 * Function to retrieve name of selected comodity from input with "comodity_selection" id (S&P500 is escaped to sp500)
 * @returns {string} selected comodity name 
 * @memberof Graphs
 */
function getComodity(){
    let el = /** @type {HTMLSelectElement} */ (document.getElementById("comodity_selection"))
    let comodity = el.value
    if(comodity === "S&P500"){
        comodity = "sp500"
    }
    return comodity
}

/**
 * Function to retrieve all comodities that can be selected. These comodities are retrieved from element with "comodity_selection" id. Each childNode is parsed and its value is added to result.<br>
 * <code>!! S&P500 is escaped to sp500 !!<code>
 * @returns {Array.<string>}
 * @memberof Graphs
 */
function getAllComodities(){
    let selectEl = /** @type {HTMLSelectElement} */(document.getElementById("comodity_selection"))
    let res = []
    for(let i = 0; i < selectEl.childNodes.length; i++){
        let child = /** @type {HTMLOptionElement} */(selectEl.childNodes[i])
        let comodity = child.value
        if(comodity){
            if(comodity === "S&P500"){
                comodity = "sp500"
            }
            res.push(comodity)
        }
    }
   return res
}

/**
 * Function to retrieve all currencies that can be selected. These currencies are retrieved from element with "currency" id. Each childNode is parsed and its value is added to result array.
 * @returns {Array.<string>}
 * @memberof Graphs
 */
function getAllCurrencies(){
    let selectEl = /** @type {HTMLSelectElement}*/(document.getElementById("currency"))
    let res = []
    for(let i = 0; i < selectEl.childNodes.length; i++){
        let child = /** @type {HTMLOptionElement}*/(selectEl.childNodes[i])
        let currency = child.value
        if(currency){
            res.push(currency)
        }
    }
   return res
}

/**
 * Function to normalize date into DD.MM.YYYY form
 * @param {string} dateStr - string representing date in any format supported by Date (see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format|MDN})
 * @returns {string} - date in a DD.MM.YYYY format as string
 * @memberof Graphs
 */
function normalize_date_for_graph(dateStr){
    let date = new Date(dateStr)
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()

    return `${day}.${month}.${year}`
}

/**
 * Function to create line graph using {@link https://www.chartjs.org/|ChartJS} library 
 * @function create_line_graph
 * @param {Array.<number>} data - prices to show
 * @param {Array.<string>} labels - dates to show
 * @param {string} label - label for whole dataset
 * @param {string} id - id of canvas element
 * @param {boolean} dynamic - determines if created graph represents dynamic or static one
 * @memberof Graphs
 */
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
    
    let canvas = /** @type {HTMLCanvasElement}*/(document.getElementById(id))
    let ctx = /** @type {CanvasRenderingContext2D} */(canvas.getContext("2d"))
    if(myChart && dynamic){
        myChart.destroy()
    }
    // Vytvorte nový graf typu 'line'
    // @ts-ignore
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
                // @ts-ignore
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
        myChart = chart;
        /** @type {HTMLButtonElement}*/(document.getElementById("reset_zoom")).addEventListener("click", () => {
            myChart.resetZoom()
        })
    }
    else
        static_graphs[id] = chart
}

/**
 * Function to create custom graph based on given month and year
 * @deprecated - custom graph is not implemented
 * @memberof Graphs
 */
async function create_graph_of_year_month(){
    let year = (/** @type {HTMLInputElement}*/(document.getElementById("graph_year"))).value
    let month = (/** @type {HTMLInputElement}*/(document.getElementById("graph_month"))).value
    let currency = (/** @type {HTMLSelectElement}*/(document.getElementById("currency"))).value
    let type = "month_year"

    let req_body = {
        year,
        month,
        currency,
        type
    }

    let req_body_str = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")

    let url =  `./API/GraphDataAPI.php?${req_body_str}`

    let api_res = await fetch(url, {
        method: "GET"
    })

    let parsed_json = await api_res.json()

    let prices = parsed_json.map((/** @type {number}*/data) => data[0])
    let labels = parsed_json.map((/** @type {string}*/data) => data[1])

    let graph_label = `Cena zlata: ${month}. mesiac , rok ${year}`

    //create_line_graph(prices, labels, graph_label)
   
}

/**
 * Transform given date to YYYY-MM-DD format
 * @param {Date} date date to normalize
 * @returns {string}
 * @memberof Graphs
 */
function normalize_date_for_db(date){
    let day = `${date.getDate()}`
    let month = `${date.getMonth() + 1}`
    let year = `${date.getFullYear()}`

    if(day.length === 1){
        day = `0${day}`
    }
    if(month.length === 1){
        month = `0${month}`
    }
    return `${year}-${month}-${day}`
}

/**
 * Function to create graph for given comodity from start to end.
 * Makes API call to retrieve data for graph and then calls {@link Graphs.create_line_graph} function
 * @function create_graph
 * @param {Date} start - starting date for graph
 * @param {Date} end - end date for graph 
 * @param {string} comodity - for which comodity should the graph be generated 
 * @param {string} label - string used in title (retrieved from graph_labels variable)
 * @param {string | null} currency - in which currency should the graph be displayed
 * @param {boolean} dynamic - determines whether graph should be generated in the place of dynamic graph or not
 * @param {string} id - id of the canvas to generate graph on (my_chart = id of dynamic graph)
 * @memberof Graphs
 */
async function create_graph(start, end, comodity, label, currency = null, dynamic = true, id = "my_chart"){
    let end_date = normalize_date_for_db(end)
    let start_date = normalize_date_for_db(start)
    let curr;
    if(!currency){
        curr = (/** @type {HTMLSelectElement}*/(document.getElementById("currency"))).value
    }
    else{
        curr = currency
    }

    let req_body = {
        end_date,
        start_date,
        currency: curr,
        comodity,
        graph_type: "price_graph"
    }

    let req_body_str = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")
    let url = `./API/GraphDataAPI.php?${req_body_str}`
    let res = await fetch(url, {
        method: "GET"
    })
    .catch(err => console.log(err))
    if(!res){return;}

    let data = await res.json()
            .catch(err => console.log(err)) 

    let prices = data.map((/** @type {string} */d) => d[0])
    let dates = data.map((/** @type {string}*/d) => d[1]).map(normalize_date_for_graph)

    let graph_label = `Cena ${comodity_to_title[comodity]}: ${label} (${currency_dict[curr]})`

    create_line_graph(prices, dates, graph_label, id, dynamic)
}

/**
 * Exports canvas into png file and downloads it
 * @param {boolean} dynamic - determines if user wants to download static or dynamic graph 
 * @param {string} id - id of static graph to download
 * @memberof Graphs
 */
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

/**
 * Creates pop-up window, using {@link https://sweetalert2.github.io/|Swal} library, for user to configure new static graph.
 * @function chose_comodity_to_add
 * @memberof Graphs
 */
async function chose_comodity_to_add(){
    
    let allComodities = getAllComodities()

    let options = ""
    for(let i = 0; i < allComodities.length; i++){
        options = options.concat(`<option value='${allComodities[i]}'>${dict[allComodities[i].toLowerCase()]}</option>`)
    }

    let sizeOptions = ""
    let selection_values = Object.keys(graph_labels)
    let selection_text = Object.values(graph_labels)
    for(let i = 0; i < selection_text.length; i++){
        sizeOptions = sizeOptions.concat(`<option value='${selection_values[i]}'>${selection_text[i]}</option>`)
    }

    let allCurrencies = getAllCurrencies()
    let currencies = ""
    for(let i = 0; i < allCurrencies.length; i++){
        currencies = currencies.concat(`<option value='${allCurrencies[i]}'>${currency_dict_select[allCurrencies[i]]}</option>`)
    }
    
    let htmlContent = `
        <select class="swal2-select" id="comodity_to_add_select">
            ${options}
        </select>
        <select class="swal2-select" id="comodity_to_add_size">
            ${sizeOptions}
        </select>
        <select class="swal2-select" id="currency_to_add_select">
            ${currencies}
        </select>
    `
    // @ts-ignore
    const {value: comodity_to_add } = await Swal.fire({
        icon: "question",
        title: "Vyberte ktoré aktívum chcete pridať.",
        html: htmlContent,
        preConfirm: () => [(/** @type {HTMLSelectElement}*/(document.getElementById("comodity_to_add_select"))).value, 
                           (/** @type {HTMLSelectElement}*/(document.getElementById("comodity_to_add_size"))).value, 
                           (/** @type {HTMLSelectElement}*/(document.getElementById("currency_to_add_select"))).value]
        
    })
    if(comodity_to_add){
        return comodity_to_add
    }
}

/**
 * Function to add new static graph.
 * Calls function {@link Graphs.chose_comodity_to_add} to get configuration for new graph.
 * Then call {@link Graphs.generate_graph_container}.
 * @memberof Graphs
 */
async function add_new_graph(){
    let graph_to_add = await chose_comodity_to_add()
    if(graph_to_add){
        let comodity = graph_to_add[0]
        let size = graph_to_add[1]
        let currency = graph_to_add[2]

        generate_graph_container(comodity, size, currency)
    }
    
}

/**
 * Function to generate new container for static graph. 
 * This function calls {@link Graphs.generate_graph_header} function. Then it calls {@link Graphs.generate_static_graph}, {@link Graphs.create_graph} and {@link Graphs.generate_graph_footer} fucntions.
 * After calling this function new graph is added to the page.
 * @function generate_graph_container
 * @param {string} comodity - for which comodity should the graph be generated
 * @param {string} size - time interval of the graph
 * @param {string} currency - in which currency should the graph be generated
 * @memberof Graphs
 */
function generate_graph_container(comodity, size, currency){
    
    let wrapper = document.createElement("div")
    let allContainers = /** @type {NodeListOf<HTMLDivElement>}*/(document.querySelectorAll("[class^=graph_]"))
    // class name: 'graph_wrapper graph_<graphNum>', split by space to get second class, then split by _ to get number 
    let lastContainerClass = allContainers[allContainers.length - 1].getAttribute("class") 
    if(lastContainerClass === null){return;}

    let lastGraphNum = Number(lastContainerClass.split(" ")[1].split("_")[1])
    let newClass = `graph_wrapper graph_${lastGraphNum+1}`
    wrapper.setAttribute("class", newClass)

    generate_graph_header(wrapper)
    generate_static_graph(wrapper, `my_chart_${lastGraphNum+1}`)
    
    allContainers[allContainers.length-1].insertAdjacentElement("afterend", wrapper)
  
    let today = new Date()
    let start = getStartDate(size)
    create_graph(start, today, comodity, graph_labels[size], currency, false, `my_chart_${lastGraphNum+1}`)
    generate_graph_footer(wrapper, `my_chart_${lastGraphNum+1}`)
}
/**
 * Function to generate header for new static graph.
 * Header includes only one img of a cross. That image has one onClick event listener that deletes this graph with its container.
 * After calling this function, generated header is automatically appended to parentElement.
 * @function generate_graph_header
 * @param {HTMLDivElement} parentElement - container to put generated header in
 * @memberof Graphs
 */
function generate_graph_header(parentElement){

    let wrapper = document.createElement("div")
    wrapper.setAttribute("class", "chart_header")

    let close_img = document.createElement("img")
    close_img.alt = "Vymazať graf"
    close_img.src = "./imgs/cross.svg"
    close_img.addEventListener("click", delete_graph)

    wrapper.appendChild(close_img)

    parentElement.appendChild(wrapper)

}

/**
 * Function to create new canvas with given canvas_id.
 * Canvas is created with width of 800 and height of 400.
 * After calling this function, created canvas is automatically appended to parent element.
 * @function generate_static_graph
 * @param {HTMLDivElement} parentElement - in this element is new canvas created
 * @param {string} canvas_id - id for the new canvas
 * @memberof Graphs
 */
function generate_static_graph(parentElement, canvas_id){
    let canvas = document.createElement("canvas")
    canvas.width = 800
    canvas.height = 400
    canvas.setAttribute("id", canvas_id)
    parentElement.appendChild(canvas)

}

/**
 * Function to generate footer for new graph. Footer contains two buttons, one is for reseting the zoom and centering the graph, second one is for downloading given graph.
 * After calling this function, generated footer is automatically appended to the parentElement.
 * @function generate_graph_footer
 * @param {HTMLDivElement} parentElement - div to add footer to
 * @param {string} id - number that was given to static graph
 * @memberof Graphs
 */

function generate_graph_footer(parentElement, id){
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
    parentElement.appendChild(wrapper)
}

/**
 * Event handler function. Handles click on cross image on every static graph.
 * This function removes given graph and its container (including footer and header).
 * @param {MouseEvent} element - listener argument
 * @memberof Graphs
 */
function delete_graph(element){
    let target = /** @type {HTMLImageElement} */ (element.target)
    let header_container = /** @type {HTMLDivElement}*/(target.parentElement)
    let main_wrapper = /** @type {HTMLDivElement}*/(header_container.parentElement)

    let canvas = /** @type {HTMLCanvasElement}*/(main_wrapper.querySelector("canvas"))
    let canvas_id = canvas.getAttribute("id")
    static_graphs[canvas_id].destroy()
    main_wrapper.innerHTML = ""
    main_wrapper.remove()
}

/**
 * This function handles event when user changes the interval for a graph. Used when there was a custom option.
 * @param {Event} e - listener argument
 * @memberof Graphs
 */
function handle_graph_selection_handler_price(e){
    let target = /** @type {HTMLSelectElement}*/(e.target)
    let value = target.value
    let elements = document.getElementsByClassName("custom")
    for(let i = 0; i < elements.length; i++){
        let element = /** @type {HTMLElement} */ (elements[i])
        element.style.display = (value === "custom") ? "block" : "none"
    }
    selection_update_handler()
}

/**
 * Function used when we tried to implement CRC graphs. Retrieves graph size using {@link Graphs.getGraphSize} and then calls {@link Graphs.create_crc_graph} with retrieved size.
 * @deprecated
 * @memberof Graphs
 */
function handle_graph_selection_handler_crc(){
    let graphSize = getGraphSize()
    create_crc_graph(graphSize)
}

/**
 * Function used to create CRC graphs. Making API call to get values for a CRC graph. Then calls {@link Graphs.create_data_set} to create data set fro chartJS. In the end calls {@link Graphs.create_CRC_line_graph} to generate new graph.
 * Development terminated.
 * @deprecated
 * @param {string} graphSize - retrieved using {@link Graphs.getGraphSize}
 * @memberof Graphs
 */
async function create_crc_graph(graphSize){

    let req_body = {
        graph_selection: graphSize
    }

    let req_body_str = Object.entries(req_body).map(([key,value]) => `${key}=${value}`).join("&")
    let url = `./API/GraphDataAPI.php?${req_body_str}`
    let res = await fetch(url, {
        method: "GET"
    })
    .catch(err => console.log(err))
    if(!res){ return;}

    let data = await res.json()
            .catch(err => console.log(err)) 
    
    let dates = data[0][1].map(d => normalize_date_for_graph(d[0]))

    let datasets = []
    for(let i = 0; i < data.length; i++){
        datasets.push(create_data_set(data[i], i))
    }    

    create_CRC_line_graph(datasets, dates)
    
}

/**
 * Function to create dataset for CRC graph.
 * @deprecated
 * @param {any} dataToProcess - data from DB
 * @param {number} dataSetId - used to set line color for dataset
 * @returns {Object} - object for chartJS input {label, data: prices, borderColor: color, borderWidth:2}
 * @memberof Graphs
 */
function create_data_set(dataToProcess, dataSetId){
    let label = dataToProcess[0]
    let prices = dataToProcess[1].map(a => a[1]) 
    let color = colors[dataSetId]
    return {
        label, data:prices, borderColor: color, borderWidth: 2
    }
}

/**
 * Function to create CRC line graph with given datasets and labels.
 * @deprecated
 * @param {Object} datasets - this object is created in {@link Graphs.create_data_set}
 * @param {Array.<string>} labels - contains labels for each graph line
 * @memberof Graphs
 */
function create_CRC_line_graph(datasets, labels){
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
    
    let canvas = /** @type{HTMLCanvasElement} */(document.getElementById("my_chart"))
    let ctx = canvas.getContext("2d")
    if(myChart){
        myChart.destroy()
    }
    // Vytvorte nový graf typu 'line'
    //@ts-ignore
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
    /** @type {HTMLButtonElement}*/(document.getElementById("reset_zoom")).addEventListener("click", () => {
        myChart.resetZoom()
    })
}

/**
 * Function used to handle change of selected graph type. Uses function {@link Graphs.getGraphType} to get selected type of graph and then updates whole page to show elements needed for given type of graph.
 * Elements that are needed for graphs of price should have "price" class, and elements for CRC graphs should have "crc" class. Also updates all event handlers.
 * @deprecated
 * @memberof Graphs
 */
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
        let end = new Date();
        let start = new Date();
        start.setMonth(start.getMonth() - 3);
        /** @type {HTMLSelectElement}*/(document.getElementById("graph_selection")).value = "3_mesiace";
        /** @type {HTMLSelectElement}*/(document.getElementById("graph_selection")).removeEventListener("change", handle_graph_selection_handler_crc);
        /** @type {HTMLSelectElement}*/(document.getElementById("graph_selection")).addEventListener("change", (e) => handle_graph_selection_handler_price(e));
        /** @type {HTMLSelectElement}*/(document.getElementById("comodity_selection")).value = "Gold";
        create_graph(start, end, "Gold", graph_labels['3_mesiace']);      
    }
    else{
        /** @type {HTMLSelectElement}*/(document.getElementById("graph_selection")).addEventListener("change", handle_graph_selection_handler_crc);
        /** @type {HTMLSelectElement}*/(document.getElementById("graph_selection")).removeEventListener("change", (e) => handle_graph_selection_handler_price(e));
    }
}


let end = new Date() // today
let start = new Date() // 3 months ago
start.setMonth(start.getMonth() - 3)
let com = getComodity();
create_graph(start, end, com, graph_labels['3_mesiace']);

/** @type{HTMLButtonElement}*/(document.getElementById("graph_download_button")).addEventListener("click", _ => {download_graph()});

let selection = /** @type {HTMLSelectElement}*/ (document.querySelector("#graph_selection"));
selection.addEventListener("change", handle_graph_selection_handler_price);

/** @type {HTMLSelectElement}*/(document.getElementById("comodity_selection")).addEventListener("change", selection_update_handler);

/** @type {HTMLSelectElement}*/(document.getElementById("currency")).addEventListener("change", selection_update_handler);


/** @type {HTMLButtonElement}*/(document.getElementById("add_comodity_btn")).addEventListener("click", add_new_graph);

//document.getElementById("graph_type").addEventListener("change", change_graph_type)
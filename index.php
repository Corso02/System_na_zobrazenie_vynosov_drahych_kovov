<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BP</title>
    <link rel="stylesheet" href="./style/common_styles.css">
    <link rel="stylesheet" href="./style/index.css">
    <script src="./scripts/index.js" defer></script>
    <script src="./scripts/TableGenerator.js" defer></script>
    <script src="./scripts/validation.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</head>
<body>
    <div id="spinner-backdrop">
        <div id="loader"></div>
    </div>
    <header>
        <h1>Systém pre zobrazenie výnosov z drahých kovov</h1>
        <div class="navbar_wrapper">
            <a href="./graphs.php">Grafy</a>
        </div>
    </header>
    <main>
        <div id="content_wrapper">
            <form action="" id="form">
                <div id="first_part">
                    <fieldset id="radio-buttons">
                        <legend>Nástroje na výpočet výnosnoti investícií</legend>
                        <div>
                            <input type="radio" id="AP" name="table_type" value="AP" checked/>
                            <label for="AP">Tabuľka ročnej miery návranosti</label>
                        </div>
                        <div>
                            <input type="radio" id="calc" name="table_type" value="calc"/>
                            <label for="calc">Kalkulačka</label>
                        </div>
                    </fieldset>
                    <div class="input_wrapper table_only active">
                        <label for="from_year">Od roku:</label>
                        <div class="input_container">
                            <input type="number" 
                                min="1979" 
                                name="from_year" 
                                id="from_year" 
                                class= ""
                                max=<?php echo date("Y")?> 
                            >
                            <div class="tooltip">
                                <span class="tooltip_text">Počiatočný rok pre tabuľku</span>
                                <img src="./imgs/info_icon.png" alt="info">
                            </div>
                        </div>
                    </div>

                    <div class="input_wrapper table_only active">
                        <label for="to_year">Po rok:</label>
                        <div class="input_container">
                            <input type="number" 
                                min="1979" 
                                name="to_year" 
                                id="to_year"
                                class= ""
                                max=<?php echo date("Y")?> 
                            >
                            <div class="tooltip">
                                <span class="tooltip_text">Konečný rok pre tabuľku</span>
                                <img src="./imgs/info_icon.png" alt="info">
                            </div>
                        </div>
                    </div>
                    <div class="input_wrapper table_only active">
                        <label for="sell_date" class="AP_only">Dátum predaja:</label>
                        <div class="input_container">
                            <input type="date" 
                                name="sell_date" 
                                class = "AP_only"
                                id="sell_date" 
                            >
                            <div class="tooltip">
                                <span class="tooltip_text">Dátum kedy by bola investícia predaná</span>
                                <img src="./imgs/info_icon.png" alt="info">
                            </div>
                        </div>
                    </div>
            


                    <label for="currency" class="table_only active">Mena:</label><br class="table_only active">
                    <select name="currency" id="currency" class="table_only active">
                        <?php
                            require_once("Database.php");
                            $db = new Database("./db/precious_metals.db");
                            $currencies = $db->get_currencies();
                            $flags = ["&#127482;&#127480;", "&#127466;&#127482;", "&#127471;&#127477;", "&#127468;&#127463;", "&#127464;&#127462;", "&#127464;&#127469;", "&#127470;&#127475;", "&#127464;&#127475;", "&#127481;&#127479;", "&#127480;&#127462;", "&#127470;&#127465;", "&#127462;&#127466;", "&#127481;&#127469;", "&#127483;&#127475;", "&#127466;&#127468;", "&#127472;&#127479;", "&#127479;&#127482;", "&#127487;&#127462;", "&#127462;&#127482;"];
                            for($i = 0; $i < count($currencies); $i++){
                                $currIdx = $i + 1;
                                if(!empty($_POST['currency']) && $_POST['currency'] == $currIdx){
                                    echo "<option value='{$currIdx}' selected>{$flags[$i]}     {$currencies[$i]}</option>";
                                }
                                else echo "<option value='{$currIdx}'>{$flags[$i]}     {$currencies[$i]}</option>";
                            }
                        ?>
                    </select><br class="table_only active">
                    <label for="comodity">Komodita:</label><br>
                    <select name="comodity" id="comodity">
                        <option id="Gold" value="Gold">Zlato</option>
                        <option id="sp500" value="sp500">S&P 500</option>
                        <option id="Silver" value="Silver">Striebro</option>
                    </select>

                    <div class="input_wrapper calc_only disabled">
                        <label for="count" class="calc_only">Množstvo:</label>
                        <div class="input_container">
                            <input type="number" name="count" id="count" value="1" step="0.01">
                        </div>
                    </div>

                    <div class="input_wrapper calc_only disabled" id="measurement">
                        <label for="measurement">Jednotka:</label>
                        <div class="input_container">
                            <select name="measurement" id="measurement_select">
                                <option value="oz">Unce</option>
                                <option value="g">Gramy</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="input_wrapper calc_only disabled">
                        <label for="buy_date_calc" class="calc_only">Dátum nákupu:</label>
                        <div class="input_container">
                            <input type="date" name="buy_date_calc" id="buy_date_calc">
                        </div>
                    </div>
                    
                    <div class="input_wrapper calc_only inline_input disabled">
                        <label for="compare_calc" class="calc_only">Porovnať s ostatnými komoditami:</label>
                        <input type="checkbox" name="compare_calc" id="compare_calc">
                    </div>

                   <!--  <div class="input_wrapper calc_only disabled">
                        <label for="buy_price_calc" class="calc_only" id="buy_price_label">Cena nákupu za jednu uncu:</label>
                        <div class="input_container">
                            <input type="number" step="0.01" name="buy_price_calc" id="buy_price_calc">
                            <div class="tooltip">
                                <span class="tooltip_text">Zadajte dátum nákupu alebo cenu</span>
                                <img src="./imgs/info_icon.png" alt="info">
                            </div>
                        </div>
                    </div> -->
                        
                    </div>
                    <div id="second_part">       
                        <label for="buy_margin" class="table_only active">Marža pri nákupe (%):</label><br class="table_only active">
                        <input type="number"
                            name="buy_margin"
                            class="table_only active"
                            value="0"
                            id="buy_margin"
                        >
                        <br class="table_only active">
                        <label for="sell_margin" class="table_only active">Marža pri predaji (%):</label><br class="table_only active">
                        <input type="number"
                            name="sell_margin"
                            class="table_only active"
                            value="0"
                            id="sell_margin"
                        >
                        <br class="table_only active">
                        <div class="last_update_date_wrapper">
                            
                        </div>
                        <div class="buttons">
                            <input type="submit" name="form_submit" value="Generuj" class="btn send_btn">
                            <button id="compare" class="btn" type="button">Porovnať tabuľky</button>
                        </div>
                    </div>
            </form>
            <div id="tables"></div>
        </div>
    </main>
    <footer>
        <p>Created by Peter Vanát</p>
    </footer>
</body>
</html>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Price Graphs</title>
    <link rel="stylesheet" href="./style/common_styles.css">
    <link rel="stylesheet" href="./style/graphs.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js" integrity="sha512-UXumZrZNiOwnTcZSHLOfcTs0aos2MzBWHXOHOuB0J/R44QB0dwY5JgfbvljXcklVf65Gc4El6RjZ+lnwd2az2g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-zoom/2.0.1/chartjs-plugin-zoom.min.js" integrity="sha512-wUYbRPLV5zs6IqvWd88HIqZU/b8TBx+I8LEioQ/UC0t5EMCLApqhIAnUg7EsAzdbhhdgW07TqYDdH3QEXRcPOQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-annotation/3.0.1/chartjs-plugin-annotation.min.js" integrity="sha512-Hn1w6YiiFw6p6S2lXv6yKeqTk0PLVzeCwWY9n32beuPjQ5HLcvz5l2QsP+KilEr1ws37rCTw3bZpvfvVIeTh0Q==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="./scripts/dictionary.js" defer></script>
    <script src="./scripts/graphs.js" defer></script>
</head>
<body>
    <header>
        <a href="index.php"><h1>Systém pre zobrazenie výnosov z drahých kovov</h1></a>
    </header>
    <main>
        <div class="graph_wrapper graph_1">
            <div class="chart_header">
               <!--  <label>Typ grafu</label>
                <select name="" id="graph_type">
                    <option value="price_graph">Graf ceny</option>
                    <option value="CRC_graph">Graf zhodnocovania</option>
                </select> -->
                <label for="graph_selection">Obdobie</label>
                <select name="" id="graph_selection">
                    <option value="30_dni">Posledných 30 dní</option>
                    <option value="60_dni">Posledných 60 dní</option>
                    <option value="3_mesiace" selected>Posledné 3 mesiace</option>
                    <option value="6_mesiacov">Posledných 6 mesiacov</option>
                    <option value="posledny_rok">Posledný rok</option>
                    <option value="posledne_2_roky">Posledné 2 roky</option>
                    <option value="poslednych_5_rokov">Posledných 5 rokov</option>
                    <option value="poslednych_10_rokov">Posledných 10 rokov</option>
                    <option value="vsetky_data">Všekty dáta</option>
                   <!-- <option value="custom">Vlastný výber</option> -->
                </select>
                <label for="comodity" class="price active">Komodita</label>
                <select name="comodity" id="comodity_selection" class="price active">
                    <?php
                        require("Database.php");
                        $db = new Database("./db/precious_metals.db");
                        $options = $db->get_comodities();
                        $dict = ["Gold"=>"Zlato", "S&P500"=>"S&P 500","Silver"=>"Striebro"];
                        for($i = 0; $i < count($options); $i++){
                            if($options[$i] == "Gold")
                                echo "<option value='{$options[$i]}' selected='selected'>{$dict[$options[$i]]}</option>";
                            else
                                echo "<option value='{$options[$i]}'>{$dict[$options[$i]]}</option>";
                        }

                    ?>
                </select>
                <label for="currency">Mena:</label>
                <select name="currency" id="currency">
                        <?php
                            require_once("Database.php");
                            $db = new Database("./db/precious_metals.db");
                            $currencies = $db->get_currencies();
                            $flags = ["&#127482;&#127480;", "&#127466;&#127482;"];
                            for($i = 0; $i < count($currencies); $i++){
                                $currIdx = $i + 1;
                                if(!empty($_POST['currency']) && $_POST['currency'] == $currIdx){
                                    echo "<option value='{$currIdx}' selected>{$flags[$i]}     {$currencies[$i]}</option>";
                                }
                                else echo "<option value='{$currIdx}'>{$flags[$i]}     {$currencies[$i]}</option>";
                            }
                        ?>
                    </select>
            </div>
            <div id="graphs">
                <canvas id="my_chart" width="800" height="400"></canvas>
                <div class="chart_footer">
                    <button id="add_comodity_btn" class="btn price active">Pridať komoditu</button>
                    <button type="submit" class="btn crc disabled send_btn">Generuj</button>
                    <button id="reset_zoom" class="btn">Vycentruj graf</button>
                    <button id="graph_download_button" class="btn">Stiahnúť graf</button>
                </div>
            </div> 
        </div>
    </main>
    <footer>
        <p>Created by Peter Vanát</p>
    </footer>
</body>
</html>
<?php
    if($_SERVER['REQUEST_METHOD'] !== 'GET'){
        http_response_code(405);
        echo "Only HTTP GET requests are supported.";
        exit;
    }
     require_once("../TableGenerator.php");
     require_once("../Database.php");
     require_once("../Logger.php");
     $logger = new Logger("../logs/app.log");
     $db = new Database("../db/precious_metals.db", $logger);
     $generator = new TablesGenerator("table_container");
     //ini_set("display_errors", 0);

    if(strcmp($_GET['table_type'], 'AP') == 0){
        $message = "TabelAPI hit: table_type: {$_GET['table_type']}, to_year: {$_GET['to_year']}, from_year: {$_GET['from_year']}, sell_date: {$_GET['sell_date']}, currency: {$_GET['currency']}, buy_margin: {$_GET['buy_margin']}, sell_margin: {$_GET['sell_margin']}, comodity: {$_GET['comodity']}";
        $logger->log("info", $message, true);
        echo json_encode($generator->get_calculation_for_AP_table($_GET['to_year'], $_GET['from_year'], $_GET['sell_date'], $_GET['currency'], $_GET['buy_margin'], $_GET['sell_margin'], $_GET['comodity'], $db));
    } 
?>
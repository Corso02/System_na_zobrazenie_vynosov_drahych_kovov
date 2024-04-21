<?php
    /**
     * @package API\TableAPI
     */

     /**
      * API endpoint for AP tables.
      * This endpoint is used to retrieve data for AP table from database. Only HTTP GET method is supported. Any other request method is denied and 405 status code is sent to client.
      * If GET request is invalid status code 400 is sent. To retrieve this data calculated data for table function {@see TablesGenerator::get_calculation_for_AP_table()} is used.
      * Response is sent in JSON format.
      * 
      * **Valid request must include:**
      *
      * **table_type:** AP
      *
      * **from_year:** start year for table
      *
      * **to_year:** end year for table
      *
      * **sell_date:** MM-DD-YYYY format
      *
      * **currency:** number representing currency
      *
      * **buy_margin:** number
      *
      * **sell_margin:** number
      *
      * **comodity:** name of comodity
      *
      * **type:** "day" | "first" | "last"
      *
      * **day_num:** only if type === "day"
      */
    function handle_request(){
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

        if(isset($_GET['table_type']) && strcmp($_GET['table_type'], 'AP') == 0){
            $message = "TabelAPI hit: table_type: {$_GET['table_type']}, to_year: {$_GET['to_year']}, from_year: {$_GET['from_year']}, sell_date: {$_GET['sell_date']}, currency: {$_GET['currency']}, buy_margin: {$_GET['buy_margin']}, sell_margin: {$_GET['sell_margin']}, comodity: {$_GET['comodity']}";
            $logger->log("info", $message, true);
            if(strcmp($_GET['type'], 'day') == 0){
                echo json_encode($generator->get_calculation_for_AP_table($_GET['to_year'], $_GET['from_year'], $_GET['sell_date'], $_GET['currency'], $_GET['buy_margin'], $_GET['sell_margin'], $_GET['comodity'], $_GET['type'], $db,  $_GET['day_num']));
            }
            else{
                echo json_encode($generator->get_calculation_for_AP_table($_GET['to_year'], $_GET['from_year'], $_GET['sell_date'], $_GET['currency'], $_GET['buy_margin'], $_GET['sell_margin'], $_GET['comodity'], $_GET['type'], $db));
            }
        } 
        else{
            http_response_code(400);
            echo "Invalid rquest.";
            exit;
        }
    }

    
    
    handle_request();
    
    

?>
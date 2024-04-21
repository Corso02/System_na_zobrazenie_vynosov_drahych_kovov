<?php

    /**
     * @package API\DateValidation
     */

    /**
     * This API endpoint is used to validate date from user. Only HTTP GET request method is supported, any other request method is denied and 405 status code is sent.
     * Function {@see Database::get_price_by_date_and_currency()} is used to check whether given date is valid for given comodity in given currency. If its not, then
     * {@see Database::get_nearest_price_date()} is called to find nearest valid date. Response is sent in JSON format.
     * 
     * **Valid request must include:**
     * 
     * **date:** MM-DD-YYYY format
     * 
     * **comodity:** name of comodity
     * 
     * **currency:** number of the currency
     * 
     * **Response format:**
     * 
     * **success:** boolean - indicates whether supplied date is valid
     * 
     * **nearestDateFound:** boolean - is present only when success is false and represents if nearest date was found
     * 
     * **nearestDate:** Date - present only when nearestDateFound is true 
     */
    function handle_request(){
        if($_SERVER['REQUEST_METHOD'] !== 'GET'){
            http_response_code(405);
            echo "Only HTTP GET requests are supported.";
            exit;
        }

        require_once("../Database.php");
        $db = new Database("../db/precious_metals.db");

        $result = array();
        $comodity = $_GET['comodity'];
        
        if(strcmp($comodity, "sp500") == 0){
            $comodity = "S&P500";
        }

        $res = $db->get_price_by_date_and_currency($_GET['date'], $_GET['currency'], $comodity);

        if(!$res){
            $result['success'] = false;
            $nearestDate = $db->get_nearest_price_date($_GET['date'], $_GET['currency'], $comodity);
            if(!$nearestDate){
                $result['nearestDateFound'] = false;
            }
            else{
                $result['nearestDateFound'] = true;
                $result['nearestDate'] = $nearestDate[0];
            }
        }
        else{
            $result['success'] = true;
        }
        echo json_encode($result);
    }
    handle_request();
?>
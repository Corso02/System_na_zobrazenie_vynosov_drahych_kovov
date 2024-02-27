<?php

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
?>
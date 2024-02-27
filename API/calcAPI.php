<?php
    if($_SERVER['REQUEST_METHOD'] !== 'GET'){
        http_response_code(405);
        echo "Only HTTP GET requests are supported.";
        exit;
    }

    session_start();
    require("../Database.php");
    $db = new Database("../db/precious_metals.db");
    // gramy treba previest na unce
    // kuknut ci je datum alebo cena, ked je datum zobrat datum z db
    // ako odpoved posielat datum poslednej ceny, finalnu cenu investicie, cenu za jednu uncu (ak jednotka bola v gramoch tak posielat v gramoch), percentualna zmena, porovnanie s ostatnymi aktivami
    // porovnanie so striebrom je vpohode bo jednotky su rovnake, pri porovnani s S&P 500 bude prevod ze jedna akcia = jedna unca
    $price;
    $comodity = $_GET['comodity'];
    if($comodity === "sp500")
        $comodity = "S&P500";

    /* if(strlen($_GET['date']) > 0){ */
    $date = date_create($_GET['date'])->format("Y-m-d");
    $price = $db->get_price_by_date_and_currency($date, "1", $comodity);
    if(!$price){
        echo json_encode(["success"=>false, "reason"=>"price_not_found"]); // 30.7.2022 pre zlato napriklad
        return;
    }
    //}
    /* else{
        $price =  $_GET['price'];
    } */
    $baseCount = $_GET['count'];
    $count;
    $metalUnit = "t. oz.";
    if($comodity != "S&P500"){
        if($_GET['unit'] === "g"){
            $count = $baseCount * 0.035274; // convert grams to ounces
            $metalUnit = "g";
        }
        else{
            $metalUnit = "t. oz.";
            $count = $baseCount;
        }
    }
    else $count = $baseCount;
    
    $currPrice = $db->get_newest_price($comodity); // price, price_date
    if(!$currPrice){
        echo json_encode(["success"=>false, "reason"=>"internal_server_error"]);
        return;
    }

    $initialInvestment = round($count * $price, 2);
    $currentValue = round($count * $currPrice["price"], 2);
    $percentChange = round((($currentValue * 100) / $initialInvestment)-100, 2);

    $res = array();
    $baseObj = array();
    $baseObj["name"] = $comodity;
    $baseObj["initial_price"] = $price;
    $baseObj["current_price"] = round($currPrice["price"], 2);
    $baseObj["current_price_date"] = date_format(date_create($currPrice["price_date"]), "d.m.Y");
    $baseObj["initial_investment_value"] = $initialInvestment;
    $baseObj["current_investment_value"] = $currentValue;
    $baseObj["percent_change"] = "$percentChange %";
    $baseObj["comodity_count"] = $baseCount;
    $comodityUnit;
    if($comodity !== "S&P500"){
        $comodityUnit = $metalUnit;
    }
    else{
        if($baseCount != 1)
            $comodityUnit = "akcie";
        else
            $comodityUnit = "akcia";
        
    }
    $baseObj['comodity_unit'] = $comodityUnit;
    

    $res["com_base"] = $baseObj;
    $shouldCompare = $_GET["compare"];
    if($shouldCompare !== "false"){
        $allComodities = $db->get_comodities();
        $otherComodities = array();
        for($id = 0; $id < count($allComodities); $id++){
            $resObj = array();
            if($allComodities[$id] === $comodity)
                continue;
            $newestPriceAndDate = $db->get_newest_price($allComodities[$id]);
            
            $newestPrice = $newestPriceAndDate["price"];
            $newestDate = $newestPriceAndDate["price_date"];
            $calculated = true; // ci bolo mozne vypocitat hodnoty pre porovnanie
            $count = 0;
            $currentInvestmentValue = 0;
            $previousPrice = 0;
            $previousInvestmentValue = 0;
            $percentChange = 0;

            $date = date_create($_GET['date'])->format("Y-m-d");
            $price = $db->get_price_by_date_and_currency($date, "1", $allComodities[$id]);
            if(!$price){
                $calculated = false;
            }
            else{
                // $initialInvestment - hodnota povodnej investicie na zaciatku
                // vypocitat pocet = $initial/$price
                $count = round($initialInvestment/$price, 2);
                if($count == 0)
                    $count = round($initialInvestment/$price, 6);
                $currentInvestmentValue = round($count * $newestPrice, 2);
                $previousPrice = $price;
                $percentChange = round((($currentInvestmentValue * 100) / $initialInvestment) - 100, 2);
            }
            if($allComodities[$id] === "S&P500")
                $resObj["comodity_count"] = $count;
            else{
                if($_GET['unit'] === "g"){
                    $resObj["comodity_count"] = round($count * 31.1035, 2);
                }
                else{
                    $resObj["comodity_count"] = $count;
                }
            }
            $comodityUnit;
            if($allComodities[$id] !== "S&P500"){
                $comodityUnit = $metalUnit;
            }
            else{
                if($baseCount !== 1)
                    $comodityUnit = "akcie";
                else
                    $comodityUnit = "akcia";
            }
            $resObj["comodity_unit"] = $comodityUnit;
            // meno, povodna cena, najnovsia cena, povodna hodnota investicie, terajsia hodnota investicie, percentualne zmena
            $resObj["name"] = $allComodities[$id];
            $resObj["initial_price"] = round($previousPrice, 2);
            $resObj["current_price"] = round($newestPrice, 2);
            $resObj["current_price_date"] = date_format(date_create($newestDate), "d.m.Y");
            $resObj["initial_investment_value"] = $initialInvestment;
            $resObj["current_investment_value"] = $currentInvestmentValue;
            $resObj["percent_change"] = "$percentChange %";
            $resObj["calculated"] = $calculated;
            $res["com_$id"] = $resObj;
        }
    }
    echo json_encode(["success"=>true, "calculations"=>$res]);
?>
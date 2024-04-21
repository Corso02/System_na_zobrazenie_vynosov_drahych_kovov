<?php
    /**
     * @package API\CalcAPI
     */
    /**
     * API endpoint to retrieve values for investment calculator.
     * 
     * Only HTTP GET request method is supported, any other request method is denied with 405 status code being sent. Firstly values for given comodity are calculated, then when argument "compare" is given
     * values for other comodities are calculated. This function will retrieve all data that are needed for calculation from database. Also there is conversion from troy ounces to stocks and vice-versa.
     * 
     * **Valid request format:**
     * 
     * **comodity:** base comodity to calculate values for 
     * 
     * **currency:** in which currency should the values be calculated
     * 
     * **date:** date when base comodity was bought
     * 
     * **unit:** in what unit was the comodity bought
     * 
     * **count:** number of stocks/troy ounces/grams were bought
     * 
     * **compare:** true | false - indicates if values for other comodities should be calculated
     * 
     * **Returned JSON:**
     * 
     *  returned JSON includes all calculations, to access calculations of base comodity you should use "com_base" key, for every other comodity you should use "com_&lt;id>" key, where id starts on 0
     *  
     *  **Object containing calculations:**
     *  
     *  each sub-object in returned JSON has these keys:
     * 
     *  **name:** - name of comodity
     * 
     *  **initial_price:** - initial price on supplied date (from GET request)
     * 
     *  **current_price:** - most recent price that could be found
     * 
     *  **current_price_date:** - date of most recent price (d.m.Y format) 
     * 
     *  **initial_investment_value:** - initial value of investment ( count * initial_price ) 
     * 
     *  **current_investment_value:** - current value of investment ( count * current_price )
     * 
     *  **percent_change:** - percent change between initial investement value and current investment value
     * 
     *  **comodity_count:** - count of bought comodity
     * 
     *  **calculated:** - true | false - indicates whether calculation for given comodity was successful
     * 
     *  **comodity_unit:** - unit for given comodity in which were calculations made
     *  
     */
    function handle_request(){
        if($_SERVER['REQUEST_METHOD'] !== 'GET'){
            http_response_code(405);
            echo "Only HTTP GET requests are supported.";
            exit;
        }

        session_start();
        require("../Database.php");
        $db = new Database("../db/precious_metals.db");
    
        $price;
        $comodity = $_GET['comodity'];
        if($comodity === "sp500")
            $comodity = "S&P500";

        $currency = $_GET['currency'];

        $date = date_create($_GET['date'])->format("Y-m-d");
        $price = $db->get_price_by_date_and_currency($date, $currency, $comodity);
        if(!$price){
            echo json_encode(["success"=>false, "reason"=>"price_not_found"]); // 30.7.2022 e.g. gold in USD
            return;
        }

        $baseCount = $_GET['count'];
        $count;
        $metalUnit = "t. oz.";
        if(strcmp($comodity, "S&P500") !== 0){
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
        
        $currPrice = $db->get_newest_price($comodity, $currency); // price, price_date
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
        $baseObj["initial_price"] = round($price, 2);
        $baseObj["current_price"] = round($currPrice["price"], 2);
        $baseObj["current_price_date"] = date_format(date_create($currPrice["price_date"]), "d.m.Y");
        $baseObj["initial_investment_value"] = $initialInvestment;
        $baseObj["current_investment_value"] = $currentValue;
        $baseObj["percent_change"] = "$percentChange %";
        $baseObj["comodity_count"] = $baseCount;
        $baseObj["calculated"] = true;
        $comodityUnit;
        if(strcmp($comodity, "S&P500") !== 0){
            $comodityUnit = $metalUnit;
        }
        else{
            if($baseCount != 1){
                if($baseCount > 5)
                    $comodityUnit = "akcií";
                else
                    $comodityUnit = "akcie";
            }
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
                $newestPriceAndDate = $db->get_newest_price($allComodities[$id], $currency);
                
                $newestPrice = $newestPriceAndDate["price"];
                $newestDate = $newestPriceAndDate["price_date"];
                $calculated = true; // if it was possible to calculate values for comparison
                $count = 0;
                $currentInvestmentValue = 0;
                $previousPrice = 0;
                $previousInvestmentValue = 0;
                $percentChange = 0;

                $date = date_create($_GET['date'])->format("Y-m-d");
                $price = $db->get_price_by_date_and_currency($date, $currency, $allComodities[$id]);
                if(!$price){
                    $calculated = false;
                }
                else{
                    // $initialInvestment - initial investment value
                    // count = $initial/$price
                    $count = round($initialInvestment/$price, 2);
                    if($count == 0)
                        $count = round($initialInvestment/$price, 6);
                    $currentInvestmentValue = round($count * $newestPrice, 2);
                    $previousPrice = $price;
                    $percentChange = round((($currentInvestmentValue * 100) / $initialInvestment) - 100, 2);
                }
                if(strcmp($allComodities[$id], "S&P500") === 0)
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
                if(strcmp($allComodities[$id], "S&P500") !== 0){
                    $comodityUnit = $metalUnit;
                }
                else{
                    if($baseCount !== 1){
                        if($baseCount >= 5)
                            $comodityUnit = "akcií";
                        else
                            $comodityUnit = "akcie";
                    }
                    else
                        $comodityUnit = "akcia";
                }
                $resObj["comodity_unit"] = $comodityUnit;
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
    }

    handle_request();
?>
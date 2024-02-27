<?php
    /*
        Written by Peter Vanát, 2023
    */

    require("Logger.php");
    require_once("TableBuilder.php");
    class TablesGenerator{
        
        private $tableBuilder;

        /**
         * @param (String) $className provide class name for div that wraps table element
         */
        function __construct($className){
            $this->tableBuilder = new TableBuilder($className);
        }

        /**
         * Function to generate table for annual performance based on date of sell
         * @param (mixed) $toYear - to which year the table should be generated
         * @param (mixed) $fromYear - from which year the table should be generated
         * @param (mixed) $sellDate - date when asset is sold
         * @param (mixed) $currency - in what currency should the table be calculated
         * @param (Database) $db - database object 
         */

        /* function generate_AP_table($toYear, $fromYear, $sellDate, $currency, $db){
            if(session_status() != PHP_SESSION_ACTIVE) 
                session_start();
            
            $numberOfYears = $toYear - $fromYear + 1;
            $years = array();
            for($i = 0; $i < $numberOfYears; $i++){
                array_push($years,  $fromYear + $i);
            }
           // $months = ["", 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            $sellPrice = $db->get_price_by_date_and_currency($sellDate, $currency);

            if(!$sellPrice){
                echo "Nebolo mozne najst cenu v dany datum predaja. Zvolte iny datum predaja.";
            }
            else{
                //$this->tableBuilder->add_table_header($months);

                /* $getClassIdx = function ($value, $idx=-1){
                    if($idx == 0 || !$value) return 0;
                    if($value > 1) return 1;
                    if($value > 0) return 2;
                    return 3;
                };

                if((isset($_SESSION['currency']) && strcmp($_POST['currency'], $_SESSION['currency']) != 0) || (isset($_SESSION['sell_date']) && strtotime($_SESSION['sell_date']) != strtotime($_POST['sell_date'])) || (isset($_SESSION['buy_margin']) && $_SESSION['buy_margin'] != $_POST['buy_margin']) || (isset($_SESSION['sell_margin']) && $_SESSION['sell_margin'] != $_POST['sell_margin'])){
                    $_SESSION = [];
                }
                
                for($yearIdx = 0; $yearIdx < $numberOfYears; $yearIdx++){
                    $row = array();
                    $args = array("");
                    array_push($row, $years[$yearIdx]);
                    if(isset($_SESSION['from_year']) && isset($_SESSION['to_year']) && isset($_SESSION['currency']) && isset($_SESSION['sell_date']) && strtotime($_SESSION['sell_date']) == strtotime($sellDate) && strcmp($currency, $_SESSION['currency']) == 0 && ($years[$yearIdx] >= $_SESSION['from_year'] && $years[$yearIdx] <= $_SESSION['to_year'])){
                        $prevCalc = $_SESSION["year_{$years[$yearIdx]}"];
                        foreach($prevCalc as $calc){
                            if(strlen("{$calc}%") == 1)
                                array_push($row, "");
                            else
                                array_push($row, "{$calc}%");
                            array_push($args, $calc);
                        }
                    }
                    else{
                        for($monthIdx = 0; $monthIdx < 12; $monthIdx++){
                            $currMonthNum = $monthIdx + 1;

                            $res = $db->get_last_price_in_month($currMonthNum, $years[$yearIdx], $currency);
                            $currPrice = $res[0];
                            $endDate = $res[1];
                            
                            $dateDiff = round((strtotime($sellDate) - strtotime($endDate)) / (60*60*24));
                            if($dateDiff >= 365){
                                $gainsOrLosses = $sellPrice - $currPrice;
                                $percentage = number_format(round((((($currPrice + $gainsOrLosses) / $currPrice) ** (365 / $dateDiff)) - 1) * 100, 2), 2, ".", '');
                                array_push($row, "{$percentage}%");
                                array_push($args, $percentage);
                            }
                            else{
                                array_push($row, "");
                                array_push($args, "");
                            }
                        }
                    }
                    //$this->tableBuilder->add_row($row, ["", "positive", "neutral", "negative"], $getClassIdx, $args, true);
                    $_SESSION["year_{$years[$yearIdx]}"] = array_slice($args, 1); 
                }
                //$this->tableBuilder->finalize_table();
                if(!isset($_SESSION['from_year']) || $_POST['from_year'] < $_SESSION['from_year'])
                    $_SESSION['from_year'] = $fromYear;
                if(!isset($_SESSION['to_year']) || $_POST['to_year'] > $_SESSION['to_year'])
                    $_SESSION['to_year'] = $toYear;
                $_SESSION['currency'] = $currency;
                $_SESSION['sell_date'] = $sellDate;
                //echo $this->tableBuilder->get_table_string();
            }
        } */

        function calculate_percent_of_price($price, $percentage){
            $absPercentage = abs($percentage);
            $percent = ($absPercentage * $price) / 100;
            return $percent;
        }

        function dummy_function($toYear, $fromYear){
            $_SESSION = [];
            $yearRes = array();
            $res = array();
            for($year = $fromYear; $year <= $toYear; $year++){
                for($month = 0; $month < 12; $month++){
                    array_push($yearRes, 5.58);
                }
                $res["year_{$year}"] = $yearRes;
                $yearRes = array();
            }
            return $res;
        }

        function get_calculation_for_AP_table($toYear, $fromYear, $sellDate, $currency, $buyMargin, $sellMargin, $comodity, $db){

            if(strcmp($comodity, "sp500") == 0){
                $comodity = "S&P500";
            }

            if(session_status() != PHP_SESSION_ACTIVE) 
                session_start();
            
            if((isset($_SESSION['currency']) && strcmp($currency, $_SESSION['currency']) != 0) || (isset($_SESSION['sell_date']) && strtotime($_SESSION['sell_date']) != strtotime($sellDate)) || (isset($_SESSION['buy_margin']) && $_SESSION['buy_margin'] != $buyMargin) || (isset($_SESSION['sell_margin']) && $_SESSION['sell_margin'] != $sellMargin) || (isset($_SESSION['comodity']) && strcmp($_SESSION['comodity'], $comodity) != 0)){
                $_SESSION = [];
            }

            $numberOfYears = $toYear - $fromYear + 1;
            $years = array();
            for($i = 0; $i < $numberOfYears; $i++){
                array_push($years,  $fromYear + $i);
            }
            $sellPrice = $db->get_price_by_date_and_currency($sellDate, $currency, $comodity);

            $calculations = array();
                
            for($yearIdx = 0; $yearIdx < $numberOfYears; $yearIdx++){
                    
                $row = array();
                     
                if(isset($_SESSION["year_{$years[$yearIdx]}"]) && isset($_SESSION['from_year']) && isset($_SESSION['to_year']) && isset($_SESSION['currency']) && isset($_SESSION['sell_date']) && isset($_SESSION['buy_margin']) && isset($_SESSION['sell_margin']) && strtotime($_SESSION['sell_date']) == strtotime($sellDate) && strcmp($currency, $_SESSION['currency']) == 0 && ($years[$yearIdx] >= $_SESSION['from_year'] && $years[$yearIdx] <= $_SESSION['to_year']) && $_SESSION['buy_margin'] == $buyMargin && $_SESSION['sell_margin'] == $sellMargin && isset($_SESSION['comodity']) && $_SESSION['comodity'] == $comodity){
                    $prevCalc = $_SESSION["year_{$years[$yearIdx]}"];
                    $row = $prevCalc;
                }
                else{
                    for($monthIdx = 0; $monthIdx < 12; $monthIdx++){
                        $currMonthNum = $monthIdx + 1;
                        $res = $db->get_last_price_in_month($currMonthNum, $years[$yearIdx], $currency, $comodity);
                        if(!$res){
                            array_push($row, "");
                        }
                        else{
                           
                            $startPrice = $res[0];
                            $endDate = $res[1];
                            $buyFees = $this->calculate_percent_of_price($startPrice, $buyMargin);
                            $sellFees = $this->calculate_percent_of_price($sellPrice, $sellMargin);    
                            $dateDiff = round((strtotime($sellDate) - strtotime($endDate)) / (60*60*24));
                            
                            if($dateDiff >= 365){
                                // total return = (kolko som na konci dostal "v cistom")/(kolko ma to na zaciatku stalo)
                                $up = ($startPrice + ($sellPrice - $startPrice));  
                                if($buyMargin >= 0 && $sellMargin >= 0) // predaj aj nakup cez brokera, cize musime zapocitat aj poplatky
                                    $totalReturn = ($up - $buyFees - $sellFees)/($startPrice + $buyFees);
                                elseif($buyMargin < 0 && $sellMargin < 0) // predaj aj nakup pod burzou
                                    $totalReturn = ($up - $sellFees)/($startPrice - $buyFees);
                                elseif($buyMargin >= 0 && $sellMargin < 0) // nakup na burze (poplatky), predaj pod burzou
                                    $totalReturn = ($up - $sellFees)/($startPrice + $buyFees);
                                else // $buyMargin < 0 && $sellMargin >= 0: nakup pod burzou ale predaj na burze, cize pri predaji musim mysliet na poplatky
                                    $totalReturn = ($up - $sellFees)/($startPrice - $buyFees);
                                $percentage = number_format(round(((($totalReturn) ** (365 / $dateDiff)) - 1) * 100, 2), 2, ".", '');
                                array_push($row, $percentage);
                            }
                            else{
                                array_push($row, "");
                            }
                        }
                    }
                }
                //$this->tableBuilder->add_row($row, ["", "positive", "neutral", "negative"], $getClassIdx, $row, true);
                $_SESSION["year_{$years[$yearIdx]}"] = $row; 
                if(!isset($_SESSION['from_year']) || $fromYear < $_SESSION['from_year'])
                    $_SESSION['from_year'] = $fromYear;
                if(!isset($_SESSION['to_year']) || $toYear > $_SESSION['to_year'])
                    $_SESSION['to_year'] = $toYear;
                $_SESSION['currency'] = $currency;
                $_SESSION['sell_date'] = $sellDate;
                $_SESSION['buy_margin'] = $buyMargin;
                $_SESSION['sell_margin'] = $sellMargin;
                $_SESSION['comodity'] = $comodity;
                $calculations["year_{$years[$yearIdx]}"] = $row;
                
            }
            return $calculations;
        }
    }
?>
<?php
    require("Logger.php");
    require_once("TableBuilder.php");
    /**
     * Class used to create datasets for AP tables.
     * @author Created by Peter Vanát, 2023
     * @package Tables
    */
    class TablesGenerator{
        
        private $tableBuilder;

        /**
         * @param String $className provide class name for div that wraps table element
         */
        function __construct($className){
            $this->tableBuilder = new TableBuilder($className);
        }

        /**
         * Function to calculate percentage of given price. Absolute value of price is used.
         * @param int $price - price to calculate percentage of
         * @param float $percentage - what percentage should be calculated
         * @return float
         */
        function calculate_percent_of_price($price, $percentage){
            $absPercentage = abs($percentage);
            $percent = ($absPercentage * $price) / 100;
            return $percent;
        }
        /**
         * @ignore
         */
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

        /**
         * Function to get all values for AP table. 
         * 
         * This function uses {@see Database::get_price_by_date_and_currency()} and {@see Database::get_prices_for_AP_calculation()} functions.
         * Return value of {@see Database::get_prices_for_AP_calculation()} is parsed to calculate values for AP table.
         * 
         * @param string $toYear - from which year should values be calculated
         * @param string $fromYear - to which year should values be calculated
         * @param string $sellDate - MM-DD-YYYY format
         * @param int $currency - id of currency
         * @param float $buyMargin - used in final calculation
         * @param float $sellMargin - used in final calculation
         * @param string $comodity - name of comodity
         * @param string $type - "last" | "first" | "day"
         * @param Database $db - reference to database object to query db
         * @param int $dayNum - default value is 0, must be suplied when $type == "day"
         * @return Array[string][float] - associative array, keys are in "year_&lt;year num>" format, and each subarray has calculations for each month in given year
         */
        function get_calculation_for_AP_table($toYear, $fromYear, $sellDate, $currency, $buyMargin, $sellMargin, $comodity, $type, $db, $dayNum = 0){

            if(strcmp($comodity, "sp500") == 0){
                $comodity = "S&P500";
            }

            $numberOfYears = $toYear - $fromYear + 1;
            $years = array();
            for($i = 0; $i < $numberOfYears; $i++){
                array_push($years,  $fromYear + $i);
            }
            $sellPrice = $db->get_price_by_date_and_currency($sellDate, $currency, $comodity);

            $calculations = array();
            $data = $db->get_prices_for_AP_calculation($comodity, $fromYear, $toYear, $currency, $type, $dayNum);
                
            for($yearIdx = 0; $yearIdx < $numberOfYears; $yearIdx++){
                    
                $row = array();
                     
                for($monthIdx = 0; $monthIdx < 12; $monthIdx++){
                    if($monthIdx >= count($data[$yearIdx])){
                        array_push($row, "");
                        continue;
                    }
                    $startPrice = $data[$yearIdx][$monthIdx][0];
                    $endDate = $data[$yearIdx][$monthIdx][1];
                    
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
                $calculations["year_{$years[$yearIdx]}"] = $row;
            }
            return $calculations;
        }
    }
?>
<?php
    /**
     * This class is used for querying SQLite database. Each statement is prepared to counter SQL injection.
     * @author Peter Vanát 
     * @package Database
     * 
    */
    class Database extends SQLite3{
        /** Needed only for debugging */
        private ?Logger $logger;
        function __construct($pathToDb, ?Logger $logger = null){
            $this->open($pathToDb);
            if(!$this) {
                echo $this->lastErrorMsg();
             }
             $this->logger = $logger;
        }

        
        /**
         * Function to insert data into table prices
         * @param Date date Date to insert 
         * @param int $price price to insert
         * @param int $currency_id id of currency to insert
         * @param int $comodity_id id of commodity
         * @return void
         */
        function insert($date, $price, $currency_id, $comodity_id){
            $statement = $this->prepare("INSERT INTO prices (price_date, price, comodity_id, currency_id) VALUES (:dt, :price, :comodity, :curr)");
            $statement->bindValue(":dt", $date);
            $statement->bindValue(":price", $price);
            $statement->bindValue(":comodity", $comodity_id);
            $statement->bindValue(":curr", $currency_id);
            $statement->execute();
        }

        /**
         * Retrieve all currencies from database
         * This function is mainly used on frontend to generate select elements for user to choose currency to work with.
         * This way only DB must be updated, and UI will stay consistent.
         * @return array<String> names of currencies
         */
        function get_currencies(){
            $queryRes = $this->query("SELECT * FROM Currencies;");
            $resArr = array();
            while($currencyArr = $queryRes->fetchArray(SQLITE3_NUM)){
                array_push($resArr, $currencyArr[0]);
            }
            return $resArr;
        }

         /**
         * Retrieve all currencies with ids from database
         * @return array<array<String,Integer>> 2D array where each subarray has [name, id] format
         */
        function get_currencies_with_ids(){
            $queryRes = $this->query("SELECT * FROM Currencies;");
            $resArr = array();
            while($currencyArr = $queryRes->fetchArray(SQLITE3_NUM)){
                array_push($resArr, $currencyArr);
            }
            return $resArr;
        }

        /**
         * Retrieve all comodities from database
         * This function is mainly used on frontend to generate select elements for user to choose comodity to work with.
         * This way only DB must be updated, and UI will stay consistent.
         * @return array<String> names of comodities
         */
        function get_comodities(){
            $queryRes = $this->query("SELECT * FROM Comodities;");
            $resArr = array();
            while($currencyArr = $queryRes->fetchArray(SQLITE3_NUM)){
                array_push($resArr, $currencyArr[0]);
            }
            return $resArr;
        }

        /**
         * Get comodity id based on given name.
         * Used when comodity name is supplied to any other function and we need to get its id.
         * @param String $comodity name of comodity to get ID of
         * @return int id of comodity
         */
        function get_comodity_id($comodity){
            $statement = $this->prepare("SELECT comodity_id FROM comodities WHERE name = :c_name");
            $statement->bindValue(":c_name", $comodity);
            $res = $statement->execute();
            if(!($id = $res->fetchArray(SQLITE3_NUM))){
                return false;
            }
            return $id[0];
        }
        
        /**
         * Retrieve price of given comodity, currency and date
         * @param String $date string which represents date
         * @param int $currency id of currency
         * @param String $comodity name of comodity
         * @return int|bool price for given comodity, on given date in given currency or false if the price couldnt be found
         */
        function get_price_by_date_and_currency($date, $currency, $comodity){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT price FROM Prices WHERE price_date=:dateVar AND currency_id=:currency_id AND comodity_id=:comodity_id;");

            $normalizedDate = date("Y-m-d", strtotime($date));
            
            $statement->bindValue(":dateVar", $normalizedDate, SQLITE3_TEXT);
            $statement->bindValue(":currency_id", $currency, SQLITE3_INTEGER);
            $statement->bindValue(":comodity_id", $comodity_id);

            $res = $statement->execute();
            
            if(!($price = $res->fetchArray(SQLITE3_NUM))){
                return false;
            }
            return $price[0];
        }

        /**
         * Retrieve last price of given comodity, in given currency in given month and year
         * @param String $month month to get last price of
         * @param String $year year to get last price of
         * @param int $currency id of currency
         * @param String $comodity name of comodity
         * @return array<mixed>|bool returns array in format [price, price_date] or false if the last price couldnt be found
         */
        function get_last_price_in_month($month, $year, $currency, $comodity){

            $comodity_id = $this->get_comodity_id($comodity);

            if(strlen($month) == 1){
                $month = "0{$month}";
            }
            $date = "{$year}-{$month}";
            $statement = $this->prepare("SELECT price, price_date FROM prices WHERE strftime('%Y-%m', price_date) = :dateVar AND currency_id=:curr AND comodity_id = :comodity_id ORDER BY price_date DESC limit 1;");

            $statement->bindValue(":dateVar", $date);
            $statement->bindValue(":curr", $currency);
            $statement->bindValue(":comodity_id", $comodity_id);

            $res = $statement->execute();

            if(!($result = $res->fetchArray(SQLITE3_NUM))){
                return false;
            }
            return $result;
        }

        /**
         * Retrieve first price of given comodity, in given currency in given month and year
         * @param String $month month to get first price of
         * @param String $year year to get first price of
         * @param int $currency id of currency
         * @param String $comodity name of comodity
         * @return array<mixed>|bool returns array in format [price, price_date] or false if the first price couldnt be found
         */
        function get_first_price_in_month($month, $year, $currency, $comodity){
                $comodity_id = $this->get_comodity_id($comodity);
    
                if(strlen($month) == 1){
                    $month = "0{$month}";
                }
                $date = "{$year}-{$month}";
                $statement = $this->prepare("SELECT price, price_date FROM prices WHERE strftime('%Y-%m', price_date) = :dateVar AND currency_id=:curr AND comodity_id = :comodity_id ORDER BY price_date ASC limit 1;");
    
                $statement->bindValue(":dateVar", $date);
                $statement->bindValue(":curr", $currency);
                $statement->bindValue(":comodity_id", $comodity_id);
    
                $res = $statement->execute();
    
                if(!($result = $res->fetchArray(SQLITE3_NUM))){
                    return false;
                }
                return $result;
            
        }

        /**
         * @deprecated
         */
        function get_first_price_in_year($year, $currency){
            $date = "{$year}-01-%";
            $statement = $this->prepare("SELECT price, price_date FROM prices WHERE price_date like :dateVar AND currency_id = :curr ORDER BY price_id limit 1;");

            $statement->bindValue(":dateVar", $date);
            $statement->bindValue(":curr", $currency);

            $res = $statement->execute();

            if(!($result = $res->fetchArray(SQLITE3_NUM))){
                return false;
            }
            return $result;
        }
        
        /**
         * Retrieves all prices in month and year for given comodity in given currency
         * @param String $year
         * @param String $month
         * @param int $currency id of currency
         * @param String $comodity name of comodity
         * @return array<array<mixed>> 2D array, where each subarray has [price, price_date] format
         */
        function get_prices_by_month_year_currency($year, $month, $currency, $comodity){
            $comodity_id = $this->get_comodity_id($comodity);

            if(strlen($month) == 1){
                $month = "0{$month}";
            }
            $date = "{$year}-{$month}-%";

            $statement = $this->prepare("SELECT price, price_date FROM prices where price_date like :dateVar and currency_id = :curr AND comodity_id = :comodity_id ORDER BY price_date");

            $statement->bindValue(":dateVar", $date);
            $statement->bindValue(":curr", $currency);
            $statement->bindValue(":comodity_id", $comodity_id);
            
            $res = $statement->execute();

            $resArr = array();
            while($price_and_date = $res->fetchArray(SQLITE3_NUM)){
                array_push($resArr, $price_and_date);
            }
            return $resArr;
        }

        /**
         * Get nearest price of comodity in given currency based on given date. Trying to find lower date first, if not successfull trying to find higher date
         * @param String $date base date
         * @param int $currency id of currency
         * @param String $comodity name of comodity
         * @return array<String>|bool array with single item containing price_date or false if price wasnt found
         */
        function get_nearest_price_date($date, $currency, $comodity){
            $date = date("Y-m-d", strtotime($date));

            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT price_date FROM prices WHERE price_date >= :dateVar and currency_id = :curr and comodity_id = :comodity_id ORDER BY price_date ASC LIMIT 1;");
            $statement->bindValue(":dateVar", $date);
            $statement->bindValue(":curr", $currency);
            $statement->bindValue(":comodity_id", $comodity_id);

            $nearestLowerRes = $statement->execute();
            if(!$res = $nearestLowerRes->fetchArray()){
                $statement = $this->prepare("SELECT price_date FROM prices WHERE price_date <= :dateVar and currency_id = :curr and comodity_id = :comodity_id ORDER BY price_date DESC LIMIT 1;");
                $statement->bindValue(":comodity_id", $comodity_id);
                $statement->bindValue(":dateVar", $date);
                $statement->bindValue(":curr", $currency);

                $nearestBiggerRes = $statement->execute();
                if(!$res = $nearestBiggerRes->fetchArray()){
                    return false;
                }
                return $res;
            }
            return $res;
        }

        /**
         * Retrieves last update date of given comodity
         * @param String $comodity comodity name
         * @return string that is last update date of given comodity
         */
        function get_last_update_date($comodity, $currency){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT date from last_update WHERE comodity_id = :comodity_id AND currency_id=:curr");
            $statement->bindValue(":comodity_id", $comodity_id);
            $statement->bindValue(":curr", $currency);

            $res = $statement->execute();
            if(!$lastUpdate = $res->fetchArray()){
                return false;
            }
            return $lastUpdate[0];
        }

        /**
         * Retrieves ticker symbol of given comodity
         * @param String $comodity comodity name
         * @return String|bool ticker symbol or false if the ticker symbol couldnt be retrieved
         */
        function get_ticker($comodity, $currency){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT ticker FROM last_update WHERE comodity_id = :comodity_id AND currency_id=:curr");
            $statement->bindValue(":comodity_id", $comodity_id);
            $statement->bindValue(":curr", $currency);

            $res = $statement->execute();
            if(!$ticker = $res->fetchArray()){
                return false;
            }
            return $ticker[0];
        }

        /**
         * Retrieves prices and price dates in given range
         * @param String $startDate bottom limit of range <YYYY-MM-DD> format
         * @param String $endDate top limit of range <YYYY-MM-DD> format
         * @param int $currency id of currency
         * @param String $comodity comodity name
         * @return array<array<string>> 2D array where each subarray has [price, price_date] format
         */
        function get_price_for_graph($startDate, $endDate, $currency, $comodity){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT price, price_date FROM prices WHERE price_date BETWEEN :startDate AND :endDate AND currency_id = :curr AND comodity_id = :comodity_id ORDER BY price_date");

            $statement->bindValue(":startDate", $startDate);
            $statement->bindValue(":endDate", $endDate);
            $statement->bindValue(":curr", $currency);
            $statement->bindValue(":comodity_id", $comodity_id);

            $res = $statement->execute();
            $resArr = array();

            while($price_and_date = $res->fetchArray(SQLITE3_NUM)){
                array_push($resArr, $price_and_date);
            }
            return $resArr;

        }

        /**
         * Checks if there is record for given comodity with given date
         * @param String $comodity name of comodity
         * @param String $date date to check <YYYY-MM-DD> format
         * @return bool true if record exists otherwise false
         */
        function check_if_data_exists($comodity, $date, $currency){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT * FROM prices WHERE price_date = :p_date AND comodity_id = :comodity_id AND currency_id=:curr");
            $statement->bindValue(":p_date", $date);
            $statement->bindValue(":comodity_id", $comodity_id);
            $statement->bindValue(":curr", $currency);

            $res = $statement->execute();
            if(!($data = $res->fetchArray(SQLITE3_NUM))){
                return false;
            }
            return true;
        }

        /**
         * Updates last update date of given comodity to given date
         * @param String $comodity name of comodity
         * @param String $date date to write to database <YYYY-MM-DD> format
         * @return void
         */
        function update_last_update_data($comodity, $date, $currency){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("UPDATE last_update SET date=:date WHERE comodity_id=:comodity_id and currency_id=:curr");
            $statement->bindValue(":date", $date);
            $statement->bindValue(":comodity_id", $comodity_id);
            $statement->bindValue(":curr", $currency);

            $statement->execute();
        }

        /**
         * Check if given ID of comodity is valid
         * @param int $comodity_id ID of comodity
         * @return bool true if given Iis valid otherwise false
         */
        function check_if_comodity_id_valid($comodity_id){
            $statement = $this->prepare("SELECT * FROM comodities WHERE comodity_id = :id");
            $statement->bindValue(":id", $comodity_id);

            $res = $statement->execute();
            if(!$data = $res->fetchArray()){
                return false;
            }
            return true;
        }

        /**
         * Retrieves all comodities with ids from database
         * @return array<array<mixed>> 2D array where each subarray in [name, id] format
         */
        function get_comodities_with_ids(){
            $statement = $this->prepare("SELECT * FROM comodities");
            $r = $statement->execute();
            $res = array();
            while($data = $r->fetchArray(SQLITE3_NUM)){
                array_push($res, $data);
            }
            return $res;
        }

        /**
         * Retrieves latest price and price_date of given comodity
         * @param String $comodity name of comodity
         * @return array<mixed>|bool array with [price, price_date] format or false if it couldnt be retrieved
         */
        function get_newest_price($comodity, $currency){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT price, price_date FROM prices WHERE comodity_id = :id AND currency_id=:curr ORDER BY price_date DESC LIMIT 1;");
            $statement->bindValue(":id", $comodity_id);
            $statement->bindValue(":curr", $currency);
            $res = $statement->execute();
            if(!($data = $res->fetchArray(SQLITE3_ASSOC))){
                return false;
            }
            return $data;
        }

        /**
         * Function that retrieves all prices for calculations of annualized performance table using CTE.
         * @param String $comodity name of comodity
         * @param String $fromYear starting year to get prices from
         * @param String $toYear end year to get prices to
         * @param String $currency id of currency 
         * @param String $type can be "last" - get last prices of each month, "first" - get first prices of each month, "custom" - get prices with given number of day or greater
         * @param int $dayNum default is zero, if $type == "custom" this param represents day number
         * @return array<array<mixed>> 2D array where each subarray has [price, price_date] format
         */
        function get_prices_for_AP_calculation($comodity, $fromYear, $toYear, $currency, $type, $dayNum = 0){
            $comodity_id = $this->get_comodity_id($comodity);
            
            $order = (strcmp($type, "last") == 0) ? "price_date DESC" : "price_date ASC";

            $query = "WITH latest AS (SELECT price_date, price, comodity_id, ROW_NUMBER() OVER (PARTITION BY strftime('%Y', price_date), strftime('%Y-%m', price_date) ORDER BY " . $order . ") AS row_num FROM prices WHERE price_date BETWEEN :FromYear AND :ToYear AND comodity_id = :comodity_id AND currency_id=:currency) SELECT price, price_date FROM latest WHERE row_num = 1";
            $queryForDay = "WITH latest AS (SELECT price, price_date, ROW_NUMBER() OVER (PARTITION BY strftime('%Y', price_date), strftime('%Y-%m', price_date) ORDER BY price_date ASC) as row_num FROM prices WHERE strftime('%d', price_date) >= :dayNum and price_date BETWEEN :FromYear AND :ToYear AND comodity_id=:comodity_id AND currency_id=:currency) SELECT price, price_date FROM latest WHERE row_num = 1;";
            
            $statement = $this->prepare($dayNum == 0 ? $query : $queryForDay);
            
            $statement->bindValue(":FromYear", "$fromYear-01-01");
            $statement->bindValue(":ToYear", "$toYear-12-31");
            $statement->bindValue(":comodity_id", $comodity_id);
            $statement->bindValue(":currency", $currency);
            if($dayNum != 0){
                if($dayNum < 10)
                    $statement->bindValue(":dayNum", "0$dayNum");    
                else
                    $statement->bindValue(":dayNum", "$dayNum");
            }

            $r = $statement->execute();
            $res = array();
            $oneYear = array();
            $endLoop = false;

            // abomination
            // vytvara pole rokov kde sa nachadzaju datumy a ceny z db pre kazdy mesiac v roku
            for($year = $fromYear; $year <= $toYear; $year++){
                $oneYear = array();
                for($month = 1; $month <= 12; $month++){
                    $data = $r->fetchArray(SQLITE3_NUM);
                    if(!$data){
                        $fetchedData = $this->get_price_for_day($year, $month, $dayNum, $comodity_id);
                        array_push($oneYear, $fetchedData);
                        continue;
                    }
                    while(!$this->check_month($data[1], $month)){
                        $fetchedData = $this->get_price_for_day($year, $month, $dayNum, $comodity_id);
                        array_push($oneYear, $fetchedData);
                        $month++;
                        if($month == 13){
                            $year++;
                            $month = 1;
                            array_push($res, $oneYear);
                            if($year > $toYear){
                                $endLoop = true;
                                break;
                            }
                            $oneYear = array();
                        }
                    }
                    if($endLoop) break;
                    array_push($oneYear, $data);
                }
                if($endLoop) break;
                array_push($res, $oneYear);
            }
            return $res;
        }

        /**
         * Check if month is consistnet with expected month
         * @param String $date date to check month of
         * @param Strign $expectedMonth
         * @return bool true if month of $date is same as $expectedMonth otherwise false
         */
        function check_month($date, $expectedMonth){
            $month = (int)date("m", strtotime($date));
            return $month == $expectedMonth;
        }

        /**
         * Tries to find price with equal or greater date, if that fails tries to find price with lower date
         * @param String $year year number as string
         * @param String $month month number as string
         * @param String $day day number as string
         * @param int $comodity_id id of comodity  
         * @return array<mixed> in [price, price_date] format
         */
        function get_price_for_day($year, $month, $day, $comodity_id){
            $statement = $this->prepare("SELECT price, price_date FROM prices WHERE price_date >= :limitDate AND comodity_id=:comodity_id ORDER BY price_date ASC LIMIT 1");

            $monthForQuery = "$month";
            if($month < 10){
                $monthForQuery = "0$month";
            }

            $dayForQuery = "$day";
            if($day < 10){
                $dayForQuery = "0$day";
            }
            
            $statement->bindValue(":comodity_id", $comodity_id);
            $statement->bindValue(":limitDate", "$year-$monthForQuery-$dayForQuery");


            $r = $statement->execute();
            if(!($data = $r->fetchArray(SQLITE3_NUM))){ // ak neexistuje najblizsi nasledujuci obchodny den tak najdem najblizsi predchadzajuci
                $statement = $this->prepare("SELECT price, price_date FROM prices WHERE price_date <= :limitDate AND comodity_id=:comodity_id ORDER BY price_date DESC LIMIT 1");
            
                $statement->bindValue(":comodity_id", $comodity_id);
                $statement->bindValue(":limitDate", "$year-$monthForQuery-$dayForQuery");
                $r1 = $statement->execute();
                if(!($data = $r1->fetchArray(SQLITE3_NUM))){
                    return false;
                }
                return $data;
            }
            return $data;
        }

        /**
         * Retrieves all prices from db, in given interval with given comodity_id and currency_id
         * @param String $fromDate lower bound of the interval
         * @param String $toDate higher bound of the interval
         * @param String $comodity_id id of comodity
         * @param String $currency_id id of currency
         * @return array<array<String>> 2D array, where each subarray has [date, price] format
         */
        function get_prices_in_interval($fromDate, $toDate, $comodity_id, $currency_id){
            $statement = $this->prepare("SELECT price_date, price FROM prices WHERE price_date BETWEEN :fromD AND :toD AND comodity_id=:comodity_id AND currency_id=:curr_id ORDER BY price_date DESC");

            $statement->bindValue(":fromD", $fromDate);
            $statement->bindValue(":toD", $toDate);
            $statement->bindValue(":comodity_id", $comodity_id);
            $statement->bindValue(":curr_id", $currency_id);

            $res = array();
            $r = $statement->execute();
            while($data = $r->fetchArray(SQLITE3_NUM)){
                array_push($res, $data);
            }
            return $res;
        }

        /**
         * Function to get the furthest date, on which one of the comodities was updated.
         * Used when retrieved conversion rates, because we want to make only one request for all conversion rates that are needed.
         * This way we get all conversion rates needed for the comodity that needs the update the most. 
         * @return array<String>|bool array with retrieved date or false when date couldnt be retrieved 
         */
        function get_furthest_last_update_date(){
            $statement = $this->prepare("SELECT date FROM last_update ORDER BY date ASC");
            $r = $statement->execute();
            if($data = $r->fetchArray(SQLITE3_NUM)){
                return $data;
            }
            return false;
        }

        /**
         * Function to get conversion rate ticker from table conversion_rates_tickers.
         * In this state of the app, we only need conversion rates from USD to EUR. If we want to extend this functionality to other currencies, I would recomend to find ticker for USD/<new_currency> pair.
         * That way there is no need to update this function. If we want to use any other pair, this function must be updated.
         * @param int $to_which_currency_id id of currency we want to convert to from USD
         * @return array<String>|bool array with retrieved ticker or false when ticker couldn't be retrieved
         */
        function get_conversion_rate_ticker($to_which_currency_id){
            $statement = $this->prepare("SELECT ticker FROM conversion_rates_tickers WHERE currency_id=:id");
            
            $statement->bindValue(":id", $to_which_currency_id);
            $r = $statement->execute();
            if($data = $r->fetchArray(SQLITE3_NUM)){
                return $data;
            }
            return false;
        }
    }
?>
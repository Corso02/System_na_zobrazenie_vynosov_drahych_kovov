<?php
    class Database extends SQLite3{
        private ?Logger $logger;
        function __construct($pathToDb, ?Logger $logger = null){
            $this->open($pathToDb);
            if(!$this) {
                echo $this->lastErrorMsg();
             }
             $this->logger = $logger;
        }

        function insert($date, $price, $currency_id, $comodity_id){
            $statement = $this->prepare("INSERT INTO prices (price_date, price, comodity_id, currency_id) VALUES (:dt, :price, :comodity, :curr)");
            $statement->bindValue(":dt", $date);
            $statement->bindValue(":price", $price);
            $statement->bindValue(":comodity", $comodity_id);
            $statement->bindValue(":curr", $currency_id);
            $statement->execute();
        }

        function get_currencies(){
            $queryRes = $this->query("SELECT * FROM Currencies;");
            $resArr = array();
            while($currencyArr = $queryRes->fetchArray(SQLITE3_NUM)){
                array_push($resArr, $currencyArr[0]);
            }
            return $resArr;
        }

        function get_comodities(){
            $queryRes = $this->query("SELECT * FROM Comodities;");
            $resArr = array();
            while($currencyArr = $queryRes->fetchArray(SQLITE3_NUM)){
                array_push($resArr, $currencyArr[0]);
            }
            return $resArr;
        }

        function get_comodity_id($comodity){
            $statement = $this->prepare("SELECT comodity_id FROM comodities WHERE name = :c_name");
            $statement->bindValue(":c_name", $comodity);
            $res = $statement->execute();
            if(!($id = $res->fetchArray(SQLITE3_NUM))){
                return false;
            }
            return $id[0];
        }
        
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

        function get_nearest_price_date($date, $currency, $comodity){
            $date = date("Y-m-d", strtotime($date));

            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT price_date FROM prices WHERE price_date <= :dateVar and currency_id = :curr and comodity_id = :comodity_id ORDER BY price_date DESC LIMIT 1;");
            $statement->bindValue(":dateVar", $date);
            $statement->bindValue(":curr", $currency);
            $statement->bindValue(":comodity_id", $comodity_id);

            $nearestLowerRes = $statement->execute();
            if(!$res = $nearestLowerRes->fetchArray()){
                $statement = $this->prepare("SELECT price_date FROM prices WHERE price_date >= :dateVar and currency_id = :curr and comodity_id = :comodity_id ORDER BY price_date DESC LIMIT 1;");
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

        function get_last_update_date($comodity){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT date from last_update WHERE comodity_id = :comodity_id");
            $statement->bindValue(":comodity_id", $comodity_id);

            $res = $statement->execute();
            if(!$lastUpdate = $res->fetchArray()){
                return false;
            }
            return $lastUpdate[0];
        }

        function get_ticker($comodity){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT ticker FROM last_update WHERE comodity_id = :comodity_id");
            $statement->bindValue(":comodity_id", $comodity_id);

            $res = $statement->execute();
            if(!$ticker = $res->fetchArray()){
                return false;
            }
            return $ticker[0];
        }

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

        function check_if_data_exists($comodity, $date){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT * FROM prices WHERE price_date = :p_date AND comodity_id = :comodity_id");
            $statement->bindValue(":p_date", $date);
            $statement->bindValue(":comodity_id", $comodity_id);

            $res = $statement->execute();
            if(!($data = $res->fetchArray(SQLITE3_NUM))){
                return false;
            }
            return true;
        }

        function update_last_update_data($comodity, $date){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("UPDATE last_update SET date=:date WHERE comodity_id=:comodity_id");
            $statement->bindValue(":date", $date);
            $statement->bindValue(":comodity_id", $comodity_id);

            $statement->execute();
        }

        function check_if_comodity_id_valid($comodity_id){
            $statement = $this->prepare("SELECT * FROM comodities WHERE comodity_id = :id");
            $statement->bindValue(":id", $comodity_id);

            $res = $statement->execute();
            if(!$data = $res->fetchArray()){
                return false;
            }
            return true;
        }

        function get_comodities_with_ids(){
            $statement = $this->prepare("SELECT * FROM comodities");
            $r = $statement->execute();
            $res = array();
            while($data = $r->fetchArray(SQLITE3_NUM)){
                array_push($res, $data);
            }
            return $res;
        }

        function get_newest_price($comodity){
            $comodity_id = $this->get_comodity_id($comodity);

            $statement = $this->prepare("SELECT price, price_date FROM prices WHERE comodity_id = :id ORDER BY price_date DESC LIMIT 1;");
            $statement->bindValue(":id", $comodity_id);
            $res = $statement->execute();
            if(!($data = $res->fetchArray(SQLITE3_ASSOC))){
                return false;
            }
            return $data;
        }
    }
?>
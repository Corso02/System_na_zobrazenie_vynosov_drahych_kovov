<?php
    $basePath = "/home/student/pv690wt/public_html/bp";
    /**
     * For anyone who is viewing this script. You'll probably be surprised that there are few places where I am using curl to make requests to an API, and there is little
     * to no change in those blocks of code. And maybe you are asking yourself "what is that? why he didn't moved that into a function?". Well I have a story to tell.
     * In the beginning I only needed to make requests in a single for loop, so there was no need to create a function for that. Everything was working fine (even through cron).
     * Than I decided to include another currency and so I needed to create different requests. So as any sane person I decided to move request logic into separate function but then...
     * I stumbled upon interesting bug or problem while using this updated script on a server. I set up a cron task to run this script and update DB every day at 6am.  
     * I was getting "host couldnt be resolved" error in funcion "make_request", but when I ran this code manually everything was alright. So I decided to not use this function, and move
     * request logic to every place where its needed. To this date I don't know what was the problem. And also I'm sorry for this abomination. If you know where the problem was and you solved
     * the problem, please let me know :)
     */
    require_once("$basePath/Database.php");
    require_once("$basePath/Logger.php");
    $logger = new Logger("$basePath/logs/app.log");
    $db = new Database("$basePath/db/precious_metals.db");

    $env = parse_ini_file("$basePath/API/.env");

    $logger->log("info", " DB-UPDATE: Starting update.\r\n");
    
    $comodities = $db->get_comodities();

   /*  function make_request($url, $logger, $httpHeaders){
        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => $httpHeaders,
        ]);

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);
        if($err){
            $logger->log("error", "DB-UPDATE: cUrl error $err. Pre URL: $url\n");
            return false;
        }

        //$file = fopen("responses.txt", "a");
        //fwrite($file, $url . "\n");
        //fwrite($file, $response);
        //fwrite($file, "KONIEC\n");
        //fclose($file);

        return json_decode($response);
    } */

    function get_conversion_rates($toCurrencyId, $db, $env, $logger){
        $furthest_date = $db->get_furthest_last_update_date();
        $last_update = date_create($furthest_date[0]);
        $previous_day_date = date_create(date('Y-m-d', time()));
        $num_of_days = date_diff($previous_day_date, $last_update)->days;
        if($num_of_days > 0){
            $ticker = $db->get_conversion_rate_ticker($toCurrencyId);
            if(!$ticker){
                echo "Nenasiel sa ticker\n";
                return false;
            }
            else{
                $encoded_ticker = urlencode($ticker[0]);
                $num_of_days += 2;
                $num_of_days_param = "{$num_of_days}d";
                $request_url = "{$env['API_URL']}/{$encoded_ticker}/{$env['REQUEST_INTERVAL']}/{$num_of_days_param}";
                $api_key = "X-RapidAPI-Key: {$env['API_KEY']}";
               // echo $request_url;

               $curl = curl_init();

               curl_setopt_array($curl, [
                   CURLOPT_URL => $request_url,
                   CURLOPT_RETURNTRANSFER => true,
                   CURLOPT_ENCODING => "",
                   CURLOPT_MAXREDIRS => 10,
                   CURLOPT_TIMEOUT => 30,
                   CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                   CURLOPT_CUSTOMREQUEST => "GET",
                   CURLOPT_HTTPHEADER => ["X-RapidAPI-Host: yahoo-finance127.p.rapidapi.com", $api_key],
               ]);
       
               $r = curl_exec($curl);
               $err = curl_error($curl);
       
               curl_close($curl);
               if($err){
                   $logger->log("error", "DB-UPDATE: cUrl error $err. Pre URL: $request_url\n");
                   return false;
               }

               $response = json_decode($r);

                //$response = make_request($request_url, $logger, ["X-RapidAPI-Host: yahoo-finance127.p.rapidapi.com", $api_key]);
                if($response){
                    $result = array(); // [[date, conversion_rate], [date, conversion_rate], ......]
                    if(!property_exists($response, "timestamp")){
                        $logger->log("info", "DB-UPDATE: Pre kurz $ticker nebol najdeny zaznam, parameter pre pocet dni $num_of_days");
                        return false;
                    }
                    $timestamps = $response->{'timestamp'};
                    $rates = $response->{'indicators'}->{'quote'}[0]->{'close'};
                    for($resId = 0; $resId < count($rates); $resId++){
                        $subRes = array();
                        $converted_date = date("Y-m-d", $timestamps[$resId]);
                        array_push($subRes, $converted_date, $rates[$resId]);
                        array_push($result, $subRes);
                    }
                    return $result;
                }
            }
        }
        return false;
    }

    $usd_to_eur = get_conversion_rates("2", $db, $env, $logger);
    if(!$usd_to_eur){
        $logger->log("ERROR", "DB-UPDATE: Nebolo možné získať kurzy pre USD/EUR\n");
    }

    function get_conversion_rate_on_date($rates, $date){
        for($i = 0; $i < count($rates); $i++){
            $date_conv = $rates[$i][0];
            if(strcmp($date, $date_conv) == 0){
                return floatval($rates[$i][1]);
            }
        }
        return false;
    }

    $update_dates = array();

    // update in USD using YahooFinanceAPI
    for($comodityId = 0; $comodityId < count($comodities); $comodityId++){
        $last_update = date_create($db->get_last_update_date($comodities[$comodityId], "1"));
        $previous_day_date = date_create(date('Y-m-d', time()));
        $num_of_days = date_diff($previous_day_date, $last_update)->days;
        if($num_of_days > 0){
            $ticker = urlencode($db->get_ticker($comodities[$comodityId], "1"));
            $num_of_days += 2;
            $num_of_days_param = "{$num_of_days}d";
            $request_url = "{$env['API_URL']}/{$ticker}/{$env['REQUEST_INTERVAL']}/{$num_of_days_param}";
            $api_key = "X-RapidAPI-Key: {$env['API_KEY']}";

            $curl = curl_init();

            curl_setopt_array($curl, [
                CURLOPT_URL => $request_url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "GET",
                CURLOPT_HTTPHEADER => ["X-RapidAPI-Host: yahoo-finance127.p.rapidapi.com", $api_key],
            ]);
    
            $r = curl_exec($curl);
            $err = curl_error($curl);
    
            curl_close($curl);
            if($err){
                $logger->log("error", "DB-UPDATE: cUrl error $err. Pre URL: $request_url\n");
                return false;
            }

            $json_res = json_decode($r);





          //  $json_res = make_request($request_url, $logger, ["X-RapidAPI-Host: yahoo-finance127.p.rapidapi.com", $api_key]);
            if ($json_res){
                if(!property_exists($json_res, "timestamp")){
                    $logger->log("info", "DB-UPDATE: Pre komoditu $comodities[$comodityId] nebol najdeny zaznam, parameter pre pocet dni $num_of_days");
                    continue;
                }
                $timestamps = $json_res->{'timestamp'};
                $prices = $json_res->{'indicators'}->{'quote'}[0]->{'close'};
                $comodity_id = $db->get_comodity_id($comodities[$comodityId]);
                $current_date = date("Y-m-d", time());
                $count = count($prices);
                $last_updated_date = $last_update->format("Y-m-d");
                for($priceId = 0; $priceId < count($prices); $priceId++){
                    $date = date("Y-m-d", $timestamps[$priceId]);
                    $price = $prices[$priceId];
                    $logger->log("info", "DB-UPDATE DEBUG: " . $comodities[$comodityId] . " " . $date . " $price\n"); 
                    if(($date === $current_date)){
                        $logger->log("info", "DB-UPDATE: neakutalizujem, lebo je do dnesny den zaznam s rovankym datumom $date pre komoditu " . $comodities[$comodityId] . " pocet dni pre parameter {$num_of_days} \n");
                        continue;
                    }
                    if(!$db->check_if_data_exists($comodities[$comodityId], $date, "1")){
                        if(!$price){
                            $logger->log("info", "DB-UPDATE: cena pre " . $comodities[$comodityId] . " pre datum $date je null, takze neaktualizujem");
                        }
                        else{
                            $logger->log("info", "DB-UPDATE: Aktualizujem " . $comodities[$comodityId] . " pre datum: " . $date . " s cenou $price \r\n");
                            if(strcmp($comodities[$comodityId], "S&P500") == 0){ //prevadzam iba komodity, ktore nie su drahe kovy
                                $conv_rate = get_conversion_rate_on_date($usd_to_eur, $date);
                                if(!$conv_rate){
                                    $logger->log("info", "DB-UPDATE: Pre komoditu " . $comodities[$comodityId] . " pre datum " . $date . " nebol najdeny kurz USD/EUR\n");
                                }
                                else{
                                    $conv_price = $price/$conv_rate;
                                    $db->insert($date, $conv_price, "2", $comodity_id);
                                }
                            }
                            if(!in_array($date, $update_dates)){
                                array_push($update_dates, $date);
                            }
                            $db->insert($date, $price, "1", $comodity_id);
                            $last_updated_date = $date;
                        }
                    }
                    else {
                        $logger->log("info", "DB-UPDATE:neaktualizujem, lebo uz to je v db Pre komoditu " . $comodities[$comodityId] . " s ticker symbolom ". $ticker . " bol pre datum " . $date . " najdeny zaznam. last_updated_date: $last_updated_date\n");
                    }
                }
                $db->update_last_update_data($comodities[$comodityId], $last_updated_date, "1");
            } 
	    }
    }

    if(count($update_dates) > 0){
        $logger->log("info", "DB-UPDATE-EUR: Starting update for EUR\n");
        for($i = 0; $i < count($comodities); $i++){
            $last_update = date_create($db->get_last_update_date($comodities[$i], "2"));
            $previous_day_date = date_create(date('Y-m-d', time()));
            $num_of_days = date_diff($previous_day_date, $last_update)->days;
            $comodity_id = $db->get_comodity_id($comodities[$i]);
            if($num_of_days > 1){
                $ticker = $db->get_ticker($comodities[$i], "2");
                if(strcmp($ticker, "-") == 0){
                    continue;
                }
                $curr_date = date_create(date("Y-m-d", time()));
               
                $curr_updating_date = $last_update->modify("+1 day");
                while(date_diff($curr_updating_date, $curr_date)->days != 0){
                    if($curr_updating_date->format("N") > 5){
                        $logger->log("info", "DB-UPDATE-EUR: Preskakujem {$curr_updating_date->format("d.m.Y")} je to bud sobota alebo nedela\n");
                        $curr_updating_date = $curr_updating_date->modify("+1 day");
                        continue;
                    }
                    $request_url = "{$env['METALS_API']}/{$ticker}/EUR/{$curr_updating_date->format('Y-m-d')}";
                    $curr_updating_date = $curr_updating_date->modify("+1 day");
                    $api_key = "x-access-token: " .  $env['METALS_API_KEY'];

                    $curl = curl_init();

                    curl_setopt_array($curl, [
                        CURLOPT_URL => $request_url,
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_ENCODING => "",
                        CURLOPT_MAXREDIRS => 10,
                        CURLOPT_TIMEOUT => 30,
                        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                        CURLOPT_CUSTOMREQUEST => "GET",
                        CURLOPT_HTTPHEADER => [$api_key],
                    ]);
            
                    $r = curl_exec($curl);
                    $err = curl_error($curl);
            
                    curl_close($curl);
                    if($err){
                        $logger->log("error", "DB-UPDATE: cUrl error $err. Pre URL: $request_url\n");
                        return false;
                    }
        
                    $json_res = json_decode($r);
        
                    

                   // $json_res = make_request($request_url, $logger, [$api_key]);

                    if ($json_res) {
                        $date_from_timestamp = date("Y-m-d", $json_res->{'timestamp'}/1000);
                        if(property_exists($json_res, "price")){
                            if(!$db->check_if_data_exists($comodities[$i], $date_from_timestamp, "2") /*&& in_array($date_from_timestamp, $update_dates)*/ ){
                                $logger->log("info", "DB-UPDATE-EUR: Zapisujem cenu {$json_res->{'price'}} pre {$comodities[$i]}");
                                $db->insert($date_from_timestamp, $json_res->{'price'}, 2, $comodity_id);
                                $db->update_last_update_data($comodities[$i], $date_from_timestamp, "2");
                            }
                            else{
                                $logger->log("info", "DB-UPDATE-EUR: Data pre {$comodities[$i]} v EUR pre datum {$date_from_timestamp} uz existuje.\n");
                            }
                        }
                        else{
                            $logger->log("error", "DB-UPDATE-EUR: Nastala chyba pri requeste na URL: {$request_url}");
                        }
                    }
                }
            }
        }
    }
?>

<?php
    $basePath = "/mnt/c/Users/peto/Desktop/FEI/bakalarka/programovacia_cast";
    require_once("$basePath/Database.php");
    require_once("$basePath/Logger.php");
    $logger = new Logger("$basePath/logs/app.log");
    $db = new Database("$basePath/db/precious_metals.db");

    $env = parse_ini_file("$basePath/API/.env");

    $logger->log("info", " DB-UPDATE: Starting update.\r\n");
    
    $comodities = $db->get_comodities();
    for($comodityId = 0; $comodityId < count($comodities); $comodityId++){
        $last_update = date_create($db->get_last_update_date($comodities[$comodityId]));
        $previous_day_date = date_create(date('Y-m-d', time()));
        $num_of_days = date_diff($previous_day_date, $last_update)->days;
        if($num_of_days > 0){
            $ticker = urlencode($db->get_ticker($comodities[$comodityId]));
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
                CURLOPT_HTTPHEADER => [
                    "X-RapidAPI-Host: yahoo-finance127.p.rapidapi.com",
                    $api_key
                ],
            ]);

            $response = curl_exec($curl);
            $err = curl_error($curl);

            curl_close($curl);

            if ($err) {
                $logger->log("error", "DB-UPDATE: cUrl error $err\n");
            } else {
                $json_res = json_decode($response);
                if(!property_exists($json_res, "timestamp")){
                    $logger->log("info", "DB-UPDATE: Pre komoditu $comodities[$comodityId] nebol najdeny zaznam,  $date_now - parameter pre pocet dni $num_of_days");
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
                    if(!$db->check_if_data_exists($comodities[$comodityId], $date)){
                        if(!$price){
                            $logger->log("info", "DB-UPDATE: cena pre " . $comodities[$comodityId] . " pre datum $date je null, takze neaktualizujem");
                        }
                        else{
                            $logger->log("info", "DB-UPDATE: Aktualizujem " . $comodities[$comodityId] . " pre datum: " . $date . " s cenou $price \r\n");
                            $db->insert($date, $price, "1", $comodity_id);
                            $last_updated_date = $date;
                        }
                    }
                    else {
                        $logger->log("info", "DB-UPDATE:neaktualizujem, lebo uz to je v db Pre komoditu " . $comodities[$comodityId] . " s ticker symbolom ". $ticker . " bol pre datum " . $date . " najdeny zaznam. last_updated_date: $last_updated_date\n");
                    }
                }
                $db->update_last_update_data($comodities[$comodityId], $last_updated_date);
            } 
	    }
    }
?>

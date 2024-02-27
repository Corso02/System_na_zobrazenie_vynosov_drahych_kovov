<?php
    /**
     * Code to put data from csv file to database
     * Expected data format: date;price_in_usd
    */
    require("Database.php");

    if(count($argv) < 5 && $argv[1] != "-h" && $argv[1] != "--d_info"){
        die("Bol zadaný nedostatočný počet argumentov.\nPoužite argument '-h' pre pomoc.\n");
    }

    if($argv[1] === "-h"){
        echo "Prepínače:\n-c <id> : určuje číslo aktíva v databáze\n-f <cesta> : určuje cestu k súboru\n--d_info: výpis komodít z databázy\n-h : výpis manuálu\n";
        return;
    }

    $db = new Database("./db/dummy_db.db");
    if(!$db){
        die($db->lastErrorMsg());
    }

    if($argv[1] === "--d_info"){
        $comodities = $db->get_comodities_with_ids();
        for($i = 0; $i < count($comodities); $i++){
            $comodity = $comodities[$i][0];
            $id = $comodities[$i][1];
            echo "$comodity: $id\n";
        }
        return;
    }

    
    
    $inputFileName =  "";
    $comodityKey = "";

    for($argvIdx = 1; $argvIdx < count($argv); $argvIdx++){
        if($argv[$argvIdx] === "-c"){
            if($argvIdx + 1 === count($argv)) die("Po prepínači 'c' zadajte id komodity");
            if(!$db->check_if_comodity_id_valid($argv[$argvIdx+1])) die("Komodita s daným ID neexistuje");
            $comodityKey = $argv[$argvIdx + 1];
            $argvIdx++;
        }
        else if($argv[$argvIdx] === "-f"){
            if($argvIdx + 1 === count($argv)) die("Po prepínači 'f' zadajte cestu k súboru");
            if(!realpath($argv[$argvIdx + 1])) die("Zadajte cestu k existujúcemu súboru");
            $inputFileName = $argv[$argvIdx + 1];
            $mimeType = mime_content_type($inputFileName);
            $allowed = ["text/plain", "text/x-csv", "application/vnd.ms-excel"];
            if(!in_array($mimeType, $allowed)) die("Zadaný súbor nemá platný formát");
            $argvIdx++;
        }
    }
    
    //$currencies = $db->get_currencies();
   
    $inputString = file_get_contents($inputFileName, true);
    $lines = explode("\n", $inputString);
    $numOfLines = count($lines);
    $currencyId = "1";
    
    echo "NAPLNAM DB\n";

    //cycle through all lines
    for($lineIdx = 0; $lineIdx < $numOfLines; $lineIdx++){
        if($lineIdx == round($numOfLines/4)):
            echo "25%....\n";
        elseif($lineIdx == round($numOfLines/2)):
            echo "50%....\n";
        elseif($lineIdx == round($numOfLines / 2 + $numOfLines/4)):
            echo "75%....\n";
        endif;

        $line = $lines[$lineIdx];
        $lineParts = explode(";", $line);
        
        $dateStr = $lineParts[0];
        
        $date = date("Y-m-d", strtotime($lineParts[0]));
        $price = $lineParts[1];
        if(strpos($price, ",")){
            $price = str_replace(",", ".", $price);
        }
        if(strpos($price, ' ') !== false){
            $price = str_replace(" ", "", $price);
        }
        if(strpos($price, '\r') !== false){
            $price = str_replace('\r', "", $price);
        }
        $db->insert($date, $price, $currencyId, $comodityKey);
    }

    echo "HOTOVO\n";
    $db->close();
?>
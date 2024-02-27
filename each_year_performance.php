<?php
    // Kalkulacia zmeny ceny za jeden cely rok
    require("Database.php");
    $db = new Database("./db/precious_metals.db");

    function calculate_performance_of_year($year, $currencyId, $db){
        $first = $db->get_first_price_in_year($year, $currencyId);
        $last = $db->get_last_price_in_month(12, $year, $currencyId);
        
        $firstPriceDate = $first[1];
        $firstPrice = $first[0];

        $lastPriceDate = $last[1];
        $lastPrice = $last[0];

        $dateDiff = round((strtotime($lastPriceDate) - strtotime($firstPriceDate)) / (60*60*24));
        $gainsLosses = $lastPrice - $firstPrice;

        $res = number_format(round((((($firstPrice + $gainsLosses) / $firstPrice) ** (365 / $dateDiff)) - 1) * 100, 2), 2, ".", '');

        $res2 = (($lastPrice - $firstPrice) / $firstPrice)*100;

        echo $year . ": " . $res2 . "\n";
    }

    for($i = 2000; $i < 2022; $i++){
        calculate_performance_of_year($i, 1, $db);
    }
?>
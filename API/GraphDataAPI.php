<?php
     if($_SERVER['REQUEST_METHOD'] !== 'GET'){
          http_response_code(405);
          echo "Only HTTP GET requests are supported.";
          exit;
     }
     require_once("../Database.php");
     require_once("../GraphDataGenerators.php");
     $db = new Database("../db/precious_metals.db");
     $dataGen = new GraphDataGenerator($db);

   /*   if(isset($_GET['type']) && strcmp($_GET['type'], "custom") == 0)
          echo json_encode($db->get_prices_by_month_year_currency($_GET['year'], $_GET['month'], $_GET['currency'], $comodity));
     else */
     if(isset($_GET['graph_type']) && strcmp($_GET['graph_type'], "price_graph") == 0){
          $comodity = $_GET['comodity'];
          if(strcmp($comodity, "sp500") === 0){
               $comodity = "S&P500";
          }
          echo json_encode($db->get_price_for_graph($_GET['start_date'], $_GET['end_date'], $_GET['currency'], $comodity));
     }
     else // mozno pridat este check na to ci kazda komodita ma zaznam ceny vo vsetkych datumoch, cize checknem ci vsetky datasety maju rovnaku dlzku ked hej nic nic neupravujem ked nie
          // musim odfiltrovat tie zaznamy ktore su nie v ostatnych
          echo json_encode($dataGen->get_data_for_CRC_graph($_GET['graph_selection']));
?>
<?php
     /**
      * @package API\GraphDataApi
      */
     /**
      * API endpoint to retrieve data for graphs.
      * Only HTTP GET request method is supported, any other request method is denied with 405 status code being sent. If invalid GET request is sent, than status code 400 is sent.
      * To get data for graph get_price_for_graph function from GraphDataGenerators is used. To retrieve data from database function {@see Database::get_price_for_graph()} is used. Response is in JSON format.
      *
      * **Valid request format:**
      *
      * **graph_type:** "price_graph" (only supported option right now)
      *
      * **comodity:** name of comodity
      *
      * **currency:** number of the currency
      *
      * **start_date:** date in MM-DD-YYYY format
      *
      * **end_date:** date in MM-DD-YYYY format
      */
     function handle_request(){
          if($_SERVER['REQUEST_METHOD'] !== 'GET'){
               http_response_code(405);
               echo "Only HTTP GET requests are supported.";
               exit;
          }
          require_once("../Database.php");
          require_once("../GraphDataGenerators.php");
          $db = new Database("../db/precious_metals.db");
     // $dataGen = new GraphDataGenerator($db);

          if(isset($_GET['graph_type']) && strcmp($_GET['graph_type'], "price_graph") == 0){
               $comodity = $_GET['comodity'];
               if(strcmp($comodity, "sp500") === 0){
                    $comodity = "S&P500";
               }
               echo json_encode($db->get_price_for_graph($_GET['start_date'], $_GET['end_date'], $_GET['currency'], $comodity));
          }
          else{
               http_response_code(400);
               echo "Invalid rquest.";
               exit;
          }
     }

     handle_request();
?>
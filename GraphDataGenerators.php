<?php
    class GraphDataGenerator{
        private Database $db;
        private $stringFormat;
        function __construct(Database $db)
        {
            $this->db = $db;
            $this->stringFormat = [
                "30_dni"=>"-30 days",
                "60_dni"=>"-60 days",
                "3_mesiace"=>"-3 months",
                "6_mesiacov"=>"-6 months",
                "posledny_rok"=>"-1 year",
                "posledne_2_roky"=>"-2 years",
                "poslednych_5_rokov"=>"-5 years",
                "poslednych_10_rokov"=>"-10 years",
                "vsetky_data"=> "1.1.1979"
            ];
        }

        private function get_from_date_to_date_by_graph_size($graphSize){
            $toDate = date("Y-m-d", time());
            $fromDate = date("Y-m-d", strtotime($this->stringFormat[$graphSize]));
            return [$fromDate, $toDate];
        }

        private function calculate_CRC_data($dataToProcess){
            $res = array();
            for($i = 1; $i < count($dataToProcess); $i++){
                //$resForDay = (($dataToProcess[$i][0] - $dataToProcess[$i - 1][0])/$dataToProcess[$i - 1][0])*100;
                $resForDay = (($dataToProcess[0][0] - $dataToProcess[$i][0])/$dataToProcess[$i][0])*100;
                array_push($res, [$dataToProcess[$i][1],$resForDay]);
            }
            return $res;
        }

        private function check_all_same($arr){
            for($i = 1; $i < count($arr); $i++){
                if($arr[$i] != $arr[$i - 1])
                    return false;
            }
            return true;
        }

        private function filter_data($calculations){
            $lenghts = array();
            for($i = 0; $i < count($calculations); $i++){
                array_push($lenghts, count($calculations[$i][1]));
            }
            if(!$this->check_all_same($lenghts)){
                $smallestLenght = min($lenghts);
                
            }
            return $calculations;
        }

        function get_data_for_CRC_graph($graphSize){
            $comodities = $this->db->get_comodities();
            $dates = $this->get_from_date_to_date_by_graph_size($graphSize);
            $calculations = array();
            for($comodityId = 0; $comodityId < count($comodities); $comodityId++){
                $dataToProcess = $this->db->get_price_for_graph($dates[0], $dates[1], "1", $comodities[$comodityId]);
                $processedData = $this->calculate_CRC_data($dataToProcess);
                array_push($calculations, [$comodities[$comodityId], $processedData]);
            }
            $this->filter_data($calculations);
            return $calculations;
        }
    }
?>
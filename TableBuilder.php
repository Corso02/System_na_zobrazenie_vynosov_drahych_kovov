<?php
    /*
        Written by Peter Vanát, 2023
    */
    class TableBuilder{
        private $tableString;
        private $headerAdded;
        private $isFinalized;

        function __construct($containerClass){
            $this->tableString = "<div class='{$containerClass}'><table>";
            $this->headerAdded = false;
            $this->isFinalized = false;
        }
        /**
         * Add header line to table
         * @param (mixed) $array Array containing contents of header
         * @return boolean Returns true after header was added, false when header was added before
         */
        function add_table_header($array){
            if($this->headerAdded){
                return false;
            }
            $this->tableString .= "<tr>";
            for($arrayIdx = 0; $arrayIdx < count($array); $arrayIdx++){
                $this->tableString .= "<th>{$array[$arrayIdx]}</th>";
            }
            $this->tableString .= "</tr>";
            $this->headerAdded = true;
            return true;
        }
        /**
         * Add new row to table
         * @param (mixed) $array Array containing contents of given row
         * @param (String | Array) $tdClassName If string is passed this class is applied to every td element, if array is passed you need to pass function to get idx of desired class
         * @param (Function) $fn function to get index of class name from $tdClassName based on arguments
         * @param (mixed) $args Array containing argument for every cell for passed function
         * @param (boolean) $indexAsSecondParam when true the index of element is passed to function as second param
         * @param (boolean) $useArrayAsFirstParam when true values from $array argument are used as first param 
         */
        function add_row($array, $tdClassName="", $fn="", $args="", $indexAsSecondParam=false, $useArrayAsFirstParam = false){
            if(is_array($tdClassName)){
                if(!$fn){
                    trigger_error("Expected 'fn' argument when 'tdClassName' is array", E_USER_ERROR);
                    return false;
                }
                else{
                    if(!$args && !$useArrayAsFirstParam){
                        trigger_error("Expected 'args' argument when 'fn' param is passed", E_USER_ERROR);
                        return false;
                    }
                    if(count($args) != count($array) && !$useArrayAsFirstParam){
                        $argLen = count($args);
                        $arrLen = count($array);
                        trigger_error("Not enough arguments passed in 'args' array. Pass argument for every cell in a row. 'args' len: {$argLen} 'cell' len: {$arrLen}", E_USER_ERROR);
                        return false;
                    }
                }
            }
            $this->tableString .= "<tr>";
            for($arrayIdx = 0; $arrayIdx < count($array); $arrayIdx++){
                if(is_array($tdClassName)){
                    if($indexAsSecondParam && $useArrayAsFirstParam){
                        $classIdx = $fn($array[$arrayIdx], $arrayIdx);
                    }
                    elseif($indexAsSecondParam && !$useArrayAsFirstParam){
                        $classIdx = $fn($args[$arrayIdx], $arrayIdx);
                    }
                    elseif(!$indexAsSecondParam && $useArrayAsFirstParam){
                        $classIdx = $fn($array[$arrayIdx]);
                    }
                    else{
                        $classIdx = $fn($args[$arrayIdx]);
                    }
                    $this->tableString .= "<td class='{$tdClassName[$classIdx]}'>{$array[$arrayIdx]}</td>";
                }
                else{
                    $this->tableString .= "<td class='{$tdClassName}'>{$array[$arrayIdx]}</td>";
                }
            }
            $this->tableString .= "</tr>";
        }
        /**
         * Finalize HTML table string, you need to call this before retrieving final table string
         */
        function finalize_table(){
            $this->tableString .= "</table></div>";
            $this->isFinalized = true;
        }

        /**
         * Function to retrieve table string, call finalize_table() before calling this
         * @return <String | Boolean> returns false when table is not finalized or table as string when table is finalized
         */
        function get_table_string(){
            if(!$this->isFinalized){
                trigger_error("Table is not finalized. Call finalize_table() before calling get_table_string() function.", E_USER_ERROR);
                return false;
            }
            return $this->tableString;
        }

        /**
         * Call this function before creating new table
         * @param containerClass(String) class name for container for new table
         */
        function reset_generator($containerClass){
            $this->tableString = "<div class='{$containerClass}'><table>";
            $this->headerAdded = false;
            $this->isFinalized = false;
        }
    }

?>
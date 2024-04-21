<?php
    /**
     * @package Utils\Backend
     * 
     */

    /**
     * Custom logger class. Mainly used in update script.
     */
    class Logger{
        
        private $logFile;
        private $path;
        private $err;
        
        function __construct($path){
            $this->path = realpath($path);
            $this->logFile = fopen($this->path, "a") or die("Couldnt open log file");
            $this->err = null;
            if(!$this->logFile){
                $this->err = "not able to open file";
            }

        }

        /**
         * @param string $level Level of log ("info" | "warning" | "error")
         * @param string $message  Message to be logged
         * @param boolean $close Flag if file should be closed after writing message
         * @return boolean true on succesfull write otherwise false
         */

        function log($level, $message, $close = false){
            if(strcmp($level, "info") != 0 && strcmp($level, "warning") != 0 && strcmp($level, "error") != 0 || !$this->logFile){
                return false;
            }
            $time = new DateTime();
            $upper = strtoupper($level);
            $str = "{$time->format("d.m.Y, H:i:s")}: {$upper} {$message}\r\n";
            fwrite($this->logFile, $str);
            if($close){
                fclose($this->logFile);
            }
            return true;
        }
        /**
         * Close log file stream
         * @return void
         */
        function close(){
            fclose($this->logFile);
        }
    }

?>
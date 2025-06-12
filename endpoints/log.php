<?php 
function log_to_file($mensagem) {
    global $logFile;
    $dataHora = date("Y-m-d H:i:s");
    file_put_contents($logFile, "[$dataHora] $mensagem" . PHP_EOL, FILE_APPEND);
}

$logFile = realpath(__DIR__ . '/../logs') . '/log_login.txt';
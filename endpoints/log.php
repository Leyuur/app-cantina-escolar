<?php 
 date_default_timezone_set('America/Sao_Paulo');
function log_to_file($mensagem, $type = "") {
    $path = "";
    switch ($type) {
        case 'login':
            $path = "/log_login.txt";
            break;
        case "pagamentos":
            $path = "/log_pagamentos.txt";
            break;
        default:
            $path = "/log_excessoes";
    }

    $logFile = realpath(__DIR__ . '/../logs') . $path;
    $dataHora = date("Y-m-d H:i:s");
    file_put_contents($logFile, "[$dataHora] $mensagem" . PHP_EOL, FILE_APPEND);
}
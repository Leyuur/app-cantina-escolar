<?php
header('Content-Type: application/json');
include_once "./conexao.php";

// Ativar exibição de erros no servidor (para dev)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Caminho do arquivo de log (na pasta ../logs)
$logFile = realpath(__DIR__ . '/../logs') . '/log_login.txt';

// Função para escrever logs no arquivo
function log_to_file($mensagem) {
    global $logFile;
    $dataHora = date("Y-m-d H:i:s");
    file_put_contents($logFile, "[$dataHora] $mensagem" . PHP_EOL, FILE_APPEND);
}

// Lê o JSON enviado
$rawInput = file_get_contents("php://input");
log_to_file("Raw input recebido: " . $rawInput);

$input = json_decode($rawInput, true);

$response = ["success" => false];

if (isset($input["user"]) && isset($input["senha"])) {
    $user = $input["user"];
    $senha = $input["senha"];

    log_to_file("Tentando login com: user=$user, senha=$senha");

    $sql = "SELECT * FROM usuarios WHERE matricula = ? AND senha = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        log_to_file("Erro ao preparar statement: " . $conn->error);
    }

    $stmt->bind_param("ss", $user, $senha);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $response = [
            "success" => true,
            "nome" => $row["nome"],
            "matricula" => $row["matricula"],
            "saldo" => $row["saldo"]
        ];

        if ($row["adm"] == 1) {
            $response["adm"] = true;
        }

        log_to_file("Login bem-sucedido para $user");
    } else {
        log_to_file("Login falhou: usuário ou senha incorretos.");
    }

    $stmt->close();
} else {
    log_to_file("Parâmetros ausentes no JSON: " . json_encode($input));
}

echo json_encode($response);

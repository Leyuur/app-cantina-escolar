<?php
header('Content-Type: application/json');
include_once "./conexao.php";
include_once "./log.php";

// Ativar exibição de erros no servidor (para dev)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Lê o JSON enviado
$rawInput = file_get_contents("php://input");
log_to_file("Raw input recebido: " . $rawInput);

$input = json_decode($rawInput, true);

$response = ["success" => false];

if (isset($input["credito"]) && isset($input["matricula"])) {
    $credito = floatval($input["credito"]);  // Garantir que é número
    $matricula = $input["matricula"];

    log_to_file("Tentando adicionar saldo de R$ $credito para usuário $matricula.");

    $sql = "SELECT * FROM usuarios WHERE matricula = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        log_to_file("Erro ao preparar statement: " . $conn->error);
    }

    $stmt->bind_param("s", $matricula);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $saldoAtual = floatval($row["saldo"]);
        $novoSaldo = $saldoAtual + $credito;

        // Atualizar saldo no banco
        $updateSql = "UPDATE usuarios SET saldo = ? WHERE matricula = ?";
        $updateStmt = $conn->prepare($updateSql);

        if ($updateStmt) {
            $updateStmt->bind_param("ds", $novoSaldo, $matricula);
            if ($updateStmt->execute()) {
                $response = [
                    "success" => true,
                    "saldo" => $novoSaldo
                ];

                if ($row["adm"] == 1) {
                    $response["adm"] = true;
                }

                log_to_file("Saldo atualizado com sucesso para $matricula. Novo saldo: R$ $novoSaldo.");
            } else {
                log_to_file("Erro ao atualizar saldo: " . $updateStmt->error);
            }
            $updateStmt->close();
        } else {
            log_to_file("Erro ao preparar update: " . $conn->error);
        }
    } else {
        log_to_file("Usuário não encontrado com matrícula: $matricula.");
    }

    $stmt->close();
} else {
    log_to_file("Parâmetros ausentes no JSON: " . json_encode($input));
}

echo json_encode($response);

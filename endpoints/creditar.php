<?php
header('Content-Type: application/json');
include_once "./conexao.php";
include_once "./log.php";

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$rawInput = file_get_contents("php://input");
log_to_file("Raw input recebido: " . $rawInput, "pagamentos");

$input = json_decode($rawInput, true);

$response = ["success" => false];

if (isset($input["credito"]) && isset($input["matricula"])) {
    $credito = floatval($input["credito"]);
    $matricula = $input["matricula"];

    log_to_file("Tentando adicionar saldo de R$ $credito para usuário $matricula.", "pagamentos");

    $sql = "SELECT * FROM usuarios WHERE matricula = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        log_to_file("Erro ao preparar statement: " . $conn->error, "pagamentos");
    }

    $stmt->bind_param("s", $matricula);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $saldoAtual = floatval($row["saldo"]);

        // Verifica saldo insuficiente se crédito for negativo (retirada)
        if ($credito < 0 && $saldoAtual < abs($credito)) {
            $response = [
                "success" => false,
                "error" => "Este aluno (".$matricula.") não possui créditos o suficiente.",
                "saldo" => $saldoAtual
            ];
            log_to_file("Erro: créditos insuficientes para usuário $matricula. Saldo atual: R$ $saldoAtual, tentativa de retirada: R$ $credito", "pagamentos");
            echo json_encode($response);
            exit; // Para execução para evitar atualização
        }

        $novoSaldo = $saldoAtual + $credito;
        $tipo = $credito >= 0 ? "Recarga" : "Retirada";
        $descricao = isset($input["descricao"]) ? $input["descricao"] : ($tipo == "Recarga" ? "Crédito adicionado" : "Compra na cantina");

        $updateSql = "UPDATE usuarios SET saldo = ? WHERE matricula = ?";
        $updateStmt = $conn->prepare($updateSql);

        if ($updateStmt) {
            $updateStmt->bind_param("ds", $novoSaldo, $matricula);
            if ($updateStmt->execute()) {
                $insertCompraSql = "INSERT INTO compras (matricula, valor, descricao, tipo) VALUES (?, ?, ?, ?)";
                $insertCompraStmt = $conn->prepare($insertCompraSql);

                if ($insertCompraStmt) {
                    $insertCompraStmt->bind_param("sdss", $matricula, $credito, $descricao, $tipo);
                    if ($insertCompraStmt->execute()) {
                        log_to_file("Compra registrada para $matricula: R$ $credito - $descricao", "pagamentos");
                    } else {
                        log_to_file("Erro ao registrar compra: " . $insertCompraStmt->error, "pagamentos");
                    }
                    $insertCompraStmt->close();
                } else {
                    log_to_file("Erro ao preparar insert da compra: " . $conn->error, "pagamentos");
                }

                $response = [
                    "success" => true,
                    "saldo" => $novoSaldo
                ];
                if ($row["adm"] == 1) {
                    $response["adm"] = true;
                }

                log_to_file("Saldo atualizado com sucesso para $matricula. Novo saldo: R$ $novoSaldo.", "pagamentos");
            } else {
                log_to_file("Erro ao atualizar saldo: " . $updateStmt->error, "pagamentos");
            }
            $updateStmt->close();
        } else {
            log_to_file("Erro ao preparar update: " . $conn->error, "pagamentos");
        }
    } else {
        $response = [
            "success" => false,
            "error" => "Aluno não encontrado",
            "matricula" => $matricula
        ];
        log_to_file("Erro: usuário não encontrado com matrícula: $matricula.", "pagamentos");
        echo json_encode($response);
        exit;
    }


    $stmt->close();
} else {
    log_to_file("Parâmetros ausentes no JSON: " . json_encode($input), "pagamentos");
}

echo json_encode($response);

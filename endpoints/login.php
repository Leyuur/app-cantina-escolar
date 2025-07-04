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
log_to_file("Raw input recebido: " . $rawInput, "login");

$input = json_decode($rawInput, true);
$response = ["success" => false];

if (isset($input["user"]) && isset($input["senha"])) {
    $user = $input["user"];
    $senhaDigitada = $input["senha"];

    log_to_file("Tentando login com: user=$user", "login");

    // Busca o usuário pela matrícula
    $sql = "SELECT * FROM usuarios WHERE matricula = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        log_to_file("Erro ao preparar statement: " . $conn->error, "login");
    }

    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();

        $senhaHashArmazenada = $row["senha"];
        $tipo = $row["adm"] == 1 ? "adm" : ($row["funcionario"] == 1 ? "funcionario" : "aluno");

        // Se for funcionário ou admin, usa password_verify
        if (($row["adm"] == 1 || $row["funcionario"] == 1) && !password_verify($senhaDigitada, $senhaHashArmazenada)) {
            log_to_file("Senha incorreta para $tipo $user", "login");
        }
        // Se for aluno, usa comparação direta
        else if (($row["adm"] == 0 && $row["funcionario"] == 0) && $senhaDigitada !== $senhaHashArmazenada) {
            log_to_file("Senha incorreta para aluno $user", "login");
        } else {
            $response = [
                "success" => true,
                "nome" => $row["nome"],
                "matricula" => $row["matricula"],
                "saldo" => $row["saldo"]
            ];

            if ($row["adm"] == 1) {
                $response["adm"] = true;
            } else if ($row["funcionario"] == 1) {
                $response["funcionario"] = true;
            }

            log_to_file("Login bem-sucedido para $tipo $user", "login");
        }
    } else {
        log_to_file("Login falhou: usuário não encontrado", "login");
    }

    $stmt->close();
} else {
    log_to_file("Parâmetros ausentes no JSON: " . json_encode($input), "login");
}

echo json_encode($response);

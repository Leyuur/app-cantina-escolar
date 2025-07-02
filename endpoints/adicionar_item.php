<?php
header('Content-Type: application/json');
include_once "./conexao.php";

$input = json_decode(file_get_contents("php://input"), true);
$nome = $input["nome"] ?? '';
$preco = floatval($input["preco"] ?? 0);

if ($nome && $preco > 0) {
    $stmt = $conn->prepare("INSERT INTO itens (nome, preco) VALUES (?, ?)");
    $stmt->bind_param("sd", $nome, $preco);
    $success = $stmt->execute();
    echo json_encode(["success" => $success]);
} else {
    echo json_encode(["success" => false, "message" => "Dados inválidos"]);
}

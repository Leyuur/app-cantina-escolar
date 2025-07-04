<?php
include_once "./conexao.php";
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$nome = $data["nome"] ?? '';
$preco = $data["preco"] ?? 0;

if (!$nome || $preco <= 0) {
    echo json_encode(["error" => "Dados inválidos."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO itens (nome, preco) VALUES (?, ?)");
$stmt->bind_param("sd", $nome, $preco);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "id" => $stmt->insert_id]);
} else {
    echo json_encode(["error" => "Falha ao inserir."]);
}

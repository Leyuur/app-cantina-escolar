<?php
include_once "./conexao.php";
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$id = intval($data["id"] ?? 0);

if ($id <= 0) {
    echo json_encode(["error" => "ID inválido."]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM itens WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["error" => "Item não encontrado ou já excluído."]);
}

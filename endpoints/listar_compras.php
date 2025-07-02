<?php
header('Content-Type: application/json');
include_once "./conexao.php";

$input = json_decode(file_get_contents("php://input"), true);

$response = [];

if (isset($input["matricula"])) {
    $matricula = $input["matricula"];

    $sql = "SELECT id, valor, descricao, data, tipo FROM compras WHERE matricula = ? ORDER BY data DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $matricula);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $response[] = [
            "id" => $row["id"],
            "valor" => number_format($row["valor"], 2, ',', ''),
            "descricao" => $row["descricao"],
            "data" => date("Y-m-d", strtotime($row["data"])),
            "tipo" => $row["tipo"]
        ];
    }

    $stmt->close();
} else if (isset($input["todasCompras"])) {  
    $sql = "SELECT id, matricula, valor, descricao, data, tipo FROM compras ORDER BY data DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $response[] = [
            "id" => $row["id"],
            "matricula" => $row["matricula"],
            "valor" => number_format($row["valor"], 2, ',', ''),
            "descricao" => $row["descricao"],
            "data" => date("Y-m-d", strtotime($row["data"])),
            "tipo" => $row["tipo"]
        ];
    }

    $stmt->close();
}

echo json_encode($response);

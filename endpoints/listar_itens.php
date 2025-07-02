<?php
header('Content-Type: application/json');
include_once "./conexao.php";

$sql = "SELECT * FROM itens ORDER BY nome ASC";
$result = $conn->query($sql);

$itens = [];
while ($row = $result->fetch_assoc()) {
    $itens[] = $row;
}

echo json_encode($itens);

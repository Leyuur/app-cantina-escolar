<?php
include_once "./conexao.php";
header('Content-Type: application/json');

$result = mysqli_query($conn, "SELECT * FROM itens");
$itens = [];

while ($row = mysqli_fetch_assoc($result)) {
    $row['preco'] = (float)$row['preco'];
    $itens[] = $row;
}

echo json_encode($itens);

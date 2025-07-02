<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 

include_once('./conexao.php');
// Checa conexão
if ($conn->connect_error) {
    die(json_encode(['error' => 'Erro de conexão: ' . $conn->connect_error]));
}

// Busca alunos e saldo
$sql = "SELECT COUNT(*) as totalAlunos, SUM(saldo) as saldoTotal FROM usuarios WHERE adm = 0 AND funcionario = 0";
$result = $conn->query($sql);

if ($result && $row = $result->fetch_assoc()) {
    echo json_encode([
        'totalAlunos' => (int)$row['totalAlunos'],
        'saldoTotal' => (float)$row['saldoTotal']
    ]);
} else {
    echo json_encode(['error' => 'Erro na consulta']);
}

$conn->close();
?>

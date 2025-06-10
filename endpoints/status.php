<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "ID não fornecido"]);
    exit;
}

$payment_id = $_GET['id'];
$access_token = 'APP_USR-7154768145879574-060907-863d2dbf13c30c1114b5387c68aef5e6-265988860';

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => "https://api.mercadopago.com/v1/payments/$payment_id",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $access_token",
        "Content-Type: application/json"
    ]
]);

$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(["error" => "Erro ao consultar o pagamento", "detalhes" => $error]);
    exit;
}

$data = json_decode($response, true);

if (!isset($data['status'])) {
    http_response_code(404);
    echo json_encode(["error" => "Pagamento não encontrado"]);
    exit;
}

echo json_encode([
    "status" => $data['status'],
    "valor" => $data['transaction_amount']
]);

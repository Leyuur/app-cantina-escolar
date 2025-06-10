<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "ID do pagamento não informado."]);
    exit;
}

$paymentId = $input['id'];
$access_token = 'SEU_ACCESS_TOKEN_AQUI';

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => "https://api.mercadopago.com/v1/payments/$paymentId",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => 'PUT',
    CURLOPT_POSTFIELDS => json_encode(["status" => "cancelled"]),
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $access_token",
        "Content-Type: application/json"
    ]
]);

$response = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    http_response_code(500);
    echo json_encode(["error" => "Erro ao cancelar pagamento.", "detalhes" => $err]);
    exit;
}

echo json_encode(["status" => "cancelado"]);

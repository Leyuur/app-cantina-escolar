<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

$access_token = 'APP_USR-7154768145879574-060907-863d2dbf13c30c1114b5387c68aef5e6-265988860';
$tipo = $input['tipo'] ?? 'checkout';
$valor = floatval($input['valor'] ?? 0);

if ($valor <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Valor inválido"]);
    exit;
}

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// === Pix ===
if ($tipo === 'pix') {
    $body = [
        "transaction_amount" => $valor,
        "description" => "Recarga Lanchou App via Pix",
        "payment_method_id" => "pix",
        "payer" => ["email" => "pix@comprador.com"]
    ];

    $idempotencyKey = generateUUID();

    $response = enviarRequisicao("https://api.mercadopago.com/v1/payments", $access_token, $body, $idempotencyKey);
    echo json_encode([
        "qr_code_base64" => $response['point_of_interaction']['transaction_data']['qr_code_base64'] ?? null,
        "qr_code" => $response['point_of_interaction']['transaction_data']['qr_code'] ?? null,
        "status" => $response['status'],
        "id" => $response['id']
    ]);
    exit;
}

// === Cartão ===
if ($tipo === 'cartao') {
    $body = [
        "transaction_amount" => $valor,
        "token" => $input["token"],
        "description" => "Recarga Lanchou App via Cartão",
        "installments" => (int)($input["installments"]),
        "payment_method_id" => $input["payment_method_id"],
        "issuer_id" => $input["issuer_id"],
        "payer" => [
            "email" => $input["email"],
            "identification" => [
                "type" => $input["identification_type"],
                "number" => $input["identification_number"]
            ]
        ]
    ];

    $response = enviarRequisicao("https://api.mercadopago.com/v1/payments", $access_token, $body);
    echo json_encode($response);
    exit;
}

// === Checkout padrão ===
if ($tipo === 'checkout') {
    $body = [
        "items" => [[
            "title" => "Recarga Lanchou App",
            "quantity" => 1,
            "unit_price" => $valor
        ]],
        "back_urls" => [
            "success" => "https://lanchouapp.site/sucesso",
            "failure" => "https://lanchouapp.site/falhou",
            "pending" => "https://lanchouapp.site/pendente"
        ],
        "auto_return" => "approved"
    ];

    $response = enviarRequisicao("https://api.mercadopago.com/checkout/preferences", $access_token, $body);
    echo json_encode([
        "init_point" => $response["init_point"],
        "status" => "ready"
    ]);
    exit;
}

function enviarRequisicao($url, $token, $body, $idempotency = null) {
    $curl = curl_init();
    $headers = [
        "Content-Type: application/json",
        "Authorization: Bearer $token"
    ];
    if ($idempotency) {
        $headers[] = "X-Idempotency-Key: $idempotency";
    }
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_HTTPHEADER => $headers
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);

    if ($err) {
        http_response_code(500);
        echo json_encode(["error" => "Erro na requisição", "detalhes" => $err]);
        exit;
    }

    return json_decode($response, true);
}

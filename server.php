<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Lê o corpo JSON enviado pelo React
$input = json_decode(file_get_contents("php://input"), true);

// Validação do valor
if (!isset($input['valor']) || !is_numeric($input['valor'])) {
    http_response_code(400);
    echo json_encode(["error" => "Valor inválido"]);
    exit;
}

$valor = floatval($input['valor']);
$tipo = $input['tipo'] ?? 'checkout'; // padrão checkout

// Access token da sua conta Mercado Pago (modo produção)
$access_token = 'APP_USR-7154768145879574-060907-863d2dbf13c30c1114b5387c68aef5e6-265988860';

if ($tipo === 'pix') {
    // Criar pagamento PIX via API /v1/payments
    $body = [
        "transaction_amount" => $valor,
        "description" => "Recarga via Pix",
        "payment_method_id" => "pix",
        "payer" => [
            "email" => "pix@comprador.com"
        ]
    ];

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://api.mercadopago.com/v1/payments",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "Authorization: Bearer $access_token"
        ]
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);

    if ($err) {
        http_response_code(500);
        echo json_encode(["error" => "Erro na requisição", "detalhes" => $err]);
        exit;
    }

    $data = json_decode($response, true);

    if (isset($data['status']) && $data['status'] === "pending") {
        echo json_encode([
            "qr_code_base64" => $data['point_of_interaction']['transaction_data']['qr_code_base64'] ?? null,
            "qr_code" => $data['point_of_interaction']['transaction_data']['qr_code'] ?? null,
            "status" => $data['status']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Erro ao gerar pagamento Pix", "detalhes" => $data]);
    }

} else {
    // Criar preferência checkout tradicional (cartão, boleto etc)
    $body = [
        "items" => [[
            "title" => "Recarga Lanchou App",
            "quantity" => 1,
            "currency_id" => "BRL",
            "unit_price" => $valor
        ]],
        "back_urls" => [
            "success" => "https://lanchouapp.site/pagamento-sucesso?valor=" . $valor,
            "failure" => "https://lanchouapp.site/pagamento-falhou",
            "pending" => "https://lanchouapp.site/pagamento-pendente"
        ],
        "auto_return" => "approved"
    ];

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://api.mercadopago.com/checkout/preferences",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "Authorization: Bearer $access_token"
        ]
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);

    if ($err) {
        http_response_code(500);
        echo json_encode(["error" => "Erro ao criar preferência", "detalhes" => $err]);
    } else {
        $data = json_decode($response, true);
        echo json_encode(["init_point" => $data['init_point'] ?? null]);
    }
}
?>

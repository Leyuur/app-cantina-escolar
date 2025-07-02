<?php
header('Content-Type: application/json; charset=utf-8');

$host = "localhost";
$db = "u165205582_lanchouapp";
$user = "u165205582_lanchouapp";
$pass = ">hRKjFtEJ5J4";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Erro de conexão: " . $conn->connect_error]);
    exit;
}

// Lê JSON do corpo da requisição
$data = json_decode(file_get_contents("php://input"), true);

// Inicializa arrays e contadores
$alunos = $data["alunos"] ?? [];
$funcionarios = $data["funcionarios"] ?? [];

$result = [
    "alunos_inseridos" => 0,
    "alunos_ignorados" => 0,
    "funcionarios_inseridos" => 0,
    "funcionarios_ignorados" => 0,
];

// Função para verificar existência da matrícula/login
function existeUsuario($conn, $campo, $valor) {
    $stmt = $conn->prepare("SELECT 1 FROM usuarios WHERE $campo = ? LIMIT 1");
    $stmt->bind_param("s", $valor);
    $stmt->execute();
    $stmt->store_result();
    $existe = $stmt->num_rows > 0;
    $stmt->close();
    return $existe;
}

// Inserção de alunos
foreach ($alunos as $aluno) {
    $matricula = $aluno["matricula"] ?? null;
    $nome = $aluno["nome"] ?? null;
    $senha = $aluno["senha"] ?? null;

    if (!$matricula || !$nome || !$senha) {
        // Dados incompletos, ignora
        $result["alunos_ignorados"]++;
        continue;
    }

    if (existeUsuario($conn, "matricula", $matricula)) {
        // Matrícula já existe
        $result["alunos_ignorados"]++;
        continue;
    }

    // Inserir aluno: saldo 0, funcionario=0, adm=0
    $saldo = 0;
    $funcionario = 0;
    $adm = 0;

    $stmt = $conn->prepare("INSERT INTO usuarios (matricula, senha, nome, saldo, funcionario, adm) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssiii", $matricula, $senha, $nome, $saldo, $funcionario, $adm);
    if ($stmt->execute()) {
        $result["alunos_inseridos"]++;
    } else {
        $result["alunos_ignorados"]++;
    }
    $stmt->close();
}

// Inserção de funcionários
foreach ($funcionarios as $func) {
    $login = $func["login"] ?? null;
    $nome = $func["nome"] ?? null;
    $senha = $func["senha"] ?? null;

    if (!$login || !$nome || !$senha) {
        $result["funcionarios_ignorados"]++;
        continue;
    }

    if (existeUsuario($conn, "matricula", $login)) {
        // Login já existe como matrícula
        $result["funcionarios_ignorados"]++;
        continue;
    }

    // Inserir funcionário: saldo 0, funcionario=1, adm=0
    $saldo = 0;
    $funcionario = 1;
    $adm = 0;
    $matricula = $login; // aqui usaremos o login como matrícula para consistência

    $stmt = $conn->prepare("INSERT INTO usuarios (matricula, senha, nome, saldo, funcionario, adm) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssiii", $matricula, $senha, $nome, $saldo, $funcionario, $adm);
    if ($stmt->execute()) {
        $result["funcionarios_inseridos"]++;
    } else {
        $result["funcionarios_ignorados"]++;
    }
    $stmt->close();
}

echo json_encode($result);

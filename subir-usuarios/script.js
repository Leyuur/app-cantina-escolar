function processarPlanilha() {
    const input = document.getElementById('arquivo');
    if (!input.files.length) {
        mostrarToast("Selecione um arquivo!", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const alunos = [];
        for (let i = 1; i < json.length; i++) {
            const linha = json[i];
            const matricula = String(linha[0]).trim();
            const nome = String(linha[1]).trim();
            if (matricula && nome) {
                alunos.push({
                    matricula,
                    nome,
                    senha: `Ic@${matricula}`,
                    saldo: 0,
                    funcionario: 0,
                    adm: 0
                });
            }
        }

        if (alunos.length === 0) {
            mostrarToast("Nenhum aluno válido encontrado.", "error");
            return;
        }

        mostrarToast("Enviando alunos...", "success");

        fetch('upload.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alunos, funcionarios: [] })  // <-- funcionarios vazio
        })
            .then(res => res.json())
            .then(resp => {
                mostrarToast(`✅ Alunos: ${resp.alunos_inseridos} inseridos, ${resp.alunos_ignorados} ignorados.`, "success");
            })
            .catch(err => {
                console.error(err);
                mostrarToast("Erro ao enviar os dados.", "error");
            });
    };

    reader.readAsArrayBuffer(input.files[0]);
}

function cadastrarManual(e) {
    e.preventDefault();

    const matricula = document.getElementById('matriculaManual').value.trim();
    const nome = document.getElementById('nomeManual').value.trim();

    if (!matricula || !nome) {
        mostrarToast("Preencha todos os campos!", "error");
        return;
    }

    const aluno = {
        matricula,
        nome,
        senha: `Ic@${matricula}`,
        saldo: 0,
        funcionario: 0,
        adm: 0
    };

    mostrarToast("Enviando aluno...", "success");

    fetch('upload.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alunos: [aluno], funcionarios: [] })  // <-- funcionarios vazio
    })
        .then(res => res.json())
        .then(resp => {
            mostrarToast(`✅ Alunos: ${resp.alunos_inseridos} inseridos, ${resp.alunos_ignorados} ignorados.`, "success");
            document.getElementById('formManual').reset();
        })
        .catch(err => {
            console.error(err);
            mostrarToast("Erro ao cadastrar aluno.", "error");
        });
}

function cadastrarFuncionario(e) {
    e.preventDefault();

    const login = document.getElementById('loginFuncionario').value.trim();
    const nome = document.getElementById('nomeFuncionario').value.trim();
    const senha = document.getElementById('senhaFuncionario').value.trim();

    if (!login || !nome || !senha) {
        mostrarToast("Preencha todos os campos!", "error");
        return;
    }

    const funcionario = {
        login,
        nome,
        senha
    };

    mostrarToast("Enviando funcionário...", "success");

    fetch('upload.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alunos: [], funcionarios: [funcionario] })  // <-- envia como funcionarios
    })
        .then(res => res.json())
        .then(resp => {
            mostrarToast(`✅ Funcionários: ${resp.funcionarios_inseridos} inseridos, ${resp.funcionarios_ignorados} ignorados.`, "success");
            document.getElementById('formFuncionario').reset();
        })
        .catch(err => {
            console.error(err);
            mostrarToast("Erro ao cadastrar funcionário.", "error");
        });
}

function mostrarToast(mensagem, tipo = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = mensagem;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4500);
}

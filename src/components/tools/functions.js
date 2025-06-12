import { toast } from "react-toastify";

export async function verificarUsuario(user, senha) {
    try {
        const response = await fetch('https://lanchouapp.site/endpoints/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, senha })
        });

        const data = await response.json()

        if(!response.ok) {
            throw new Error("Erro na resposta do servidor.")
        }

        if(data.success) {
            return data
        } else {
            return false
        }
        
    } catch (error) {
        console.error(error)
        toast.error(error.message)
    }
}

export async function getHistorico(matricula) {
    try {
        const response = await fetch('https://lanchouapp.site/endpoints/historico.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula })
        });

        const data = await response.json()

        if(!response.ok) {
            throw new Error("Erro na resposta do servidor.")
        }

        if(data.success) {
            return data
        }
        
    } catch (error) {
        console.error(error)
        toast.error(error.message)
    }
}

export async function creditar(matricula, credito) {
    try {
        const response = await fetch('https://lanchouapp.site/endpoints/creditar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula, credito })
        });

        const data = await response.json()

        if(!response.ok) {
            throw new Error("Erro na resposta do servidor.")
        }

        if(data.success) {
            return data.saldo
        } else {
            return false
        }
        
    } catch (error) {
        console.error(error)
        toast.error(error.message)
        return false
    }
}
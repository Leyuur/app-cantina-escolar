import { useState } from "react";
import AlunoDashboard from "../AlunoDashboard/AlunoDashboard";
import AdmDashboard from "../AdmDashboard/AdmDashboard";
import "./Login.css";
import { toast } from "react-toastify";
import Loading from "../../tools/Loading/Loading";
import { verificarUsuario } from "../../tools/functions";
import logoLanchouLaranja from '../../../img/LANCHOU APP LARANJA.png'
import FuncDashboard from "../FuncDashboard/FuncDashboard";

export default function Login({ setPage }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {

    e.preventDefault();

    if (user == "" || pass == "") {
      toast.error("Você deve digitar algo.")
      return false
    }

    // setPage(<FuncDashboard setPage={setPage} nomeFunc={"teste"} />)
    // setPage(<AdmDashboard setPage={setPage} nomeAdmin={"teste"} />)
    // setPage(<AlunoDashboard setPage={setPage} />)

    setLoading(true)
    const login = await verificarUsuario(user, pass)
    setLoading(false)

    if (login.adm) {
      setPage(
        <AdmDashboard setPage={setPage} nomeAdmin={login.nome} />)
    } else if (login.funcionario) {
      setPage(
        <FuncDashboard setPage={setPage} nomeFunc={login.nome} />)
    } else if (login && !login.adm && !login.funcionario) {
      localStorage.setItem("usuario", JSON.stringify(login))
      console.log(login)
      setPage(
        <AlunoDashboard setPage={setPage} />
      )
    } else {
      toast.error("Matrícula ou senha inválida")
      return false
    }
  };

  if (localStorage.getItem("adm")) {
    const adm = JSON.parse(localStorage.getItem("adm"))
    setPage(<AdmDashboard nomeAdmin={adm.nome} setPage={setPage} />)
  }
  if (localStorage.getItem("usuario")) {
    const user = JSON.parse(localStorage.getItem("usuario"))
    setPage(<AlunoDashboard nome={user.nome} matricula={user.matricula} saldo={user.saldo} setPage={setPage} />)
  }

  return (
    <main className="login-wrapper" role="main" aria-label="Formulário de login">
      <header className="login-titulo">
        <img className="logo-lanchou" src={logoLanchouLaranja} alt="Logo Lanchou"></img>
        <p>Bem-vindo de volta!</p>
      </header>

      <form onSubmit={onSubmit} noValidate>
        <label htmlFor="username">Matrícula</label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Digite sua matrícula"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          required
          autoComplete="username"
        />

        <label htmlFor="password">Senha</label>
        <div className="password-input-wrapper">
          <input
            type={showPass ? "text" : "password"}
            id="password"
            name="password"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
            className="toggle-pass-btn"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? (
              // Ícone "olho fechado"
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                width="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ff6f00"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Ícone "olho aberto"
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                width="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ff6f00"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        <button type="submit">Entrar</button>
      </form>
      <footer>Made by <a href="https://www.instagram.com/leyuur_/" target="_blank" style={{ color: "#ff6f00" }}>Yuri Duarte</a></footer>

      {loading && (
        <Loading />
      )}
    </main>
  );
}

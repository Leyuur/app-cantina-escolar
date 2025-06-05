import { useState } from "react";
import AlunoDashboard from "../AlunoDashboard/AlunoDashboard";
import AdmDashboard from "../AdmDashboard/AdmDashboard";
import "./Login.css";

export default function Login({ setPage }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    // setPage(
    //   <AlunoDashboard
    //     nome={"Yuri"}
    //     saldo={8}
    //     matricula={"12345"}
    //     setPage={setPage}
    //   />
    // );
    setPage(
      <AdmDashboard 
        nomeAdmin={"Jorge"}
        setPage={setPage}
      />
    )
  };

  return (
    <main className="login-wrapper" role="main" aria-label="Formulário de login">
      <header className="login-titulo">
        <span className="emoji">🍔</span>
        <h2>Lanchou App</h2>
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
    </main>
  );
}

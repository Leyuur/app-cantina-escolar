import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Login from '../Login/Login';
import "./AlunoDashboard.css";

export default function AlunoDashboard({ nome, matricula, saldo, setPage }) {
  const [showRecarga, setShowRecarga] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [valorRecarga, setValorRecarga] = useState('');
  const [qrReady, setQrReady] = useState(false);
  const [dataFiltro, setDataFiltro] = useState('');
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);

    function aplicarFiltroData(novaData) {
        setDataFiltro(novaData);
        setCarregandoHistorico(true);

        setTimeout(() => {
            setCarregandoHistorico(false);
        }, 600);
    }


  const historico = [
    { tipo: 'recharge', descricao: 'Recarga', valor: 20.0, data: '2025-06-05' },
    { tipo: 'discount', descricao: 'Salgadinho e Suco', valor: 8.5, data: '2025-06-04' },
    { tipo: 'discount', descricao: 'Pastel', valor: 5.0, data: '2025-06-03' },
    { tipo: 'recharge', descricao: 'Recarga', valor: 20.0, data: '2025-06-02' },
  ];

    const historicoFiltrado = dataFiltro
    ? historico.filter((item) => item.data === dataFiltro)
    : historico;

  useEffect(() => { 
    const timeout = setTimeout(() => {
        setQrReady(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [matricula]);


  const qrRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (qrRef.current?.querySelector('canvas')) {
        setQrReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [matricula]);

  useEffect(() => {
    if (showHistorico) {
        setCarregandoHistorico(true);
        const timeout = setTimeout(() => {
        setCarregandoHistorico(false);
        }, 800);

        return () => clearTimeout(timeout);
    }
    }, [showHistorico]);


  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <span className="emoji">🍔</span>
        <h2>Lanchou App</h2>
        <p>Olá, <strong>{nome}</strong>!</p>
        <button className="btn-sair" onClick={() => setPage(<Login setPage={setPage} />)}>
            <span className="material-icons">logout</span> Sair
        </button>
      </header>


      <div className="card saldo-card">
        <h2>💰 Saldo atual</h2>
        <p className="saldo">R$ {saldo.toFixed(2)}</p>
      </div>

      <div className="card qr-card" ref={qrRef}>
        <h2>📲 Seu QR Code</h2>

        {!qrReady ? (
            <div className="qr-loading-spinner"></div>
        ) : (
            <QRCodeCanvas value={matricula} size={150} />
        )}

        <p className="matricula">Matrícula: <b>{matricula}</b></p>
      </div>

      <div className="card menu-opcoes">
        <button onClick={() => setShowRecarga(true)}>Recarregar Saldo</button>
        <button onClick={() => setShowHistorico(true)}>Ver Histórico</button>
      </div>

      {/* Modal de Recarga */}
      {showRecarga && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>➕ Recarregar Saldo</h2>
            <input
                type="text"
                placeholder="Valor em R$"
                value={valorRecarga}
                onChange={formatarValor}
            />
            <button className="confirmar">Confirmar</button>
            <button className="fechar" onClick={() => { setShowRecarga(false); setValorRecarga("")}}>Fechar</button>
          </div>
        </div>
      )}

      {/* Modal de Histórico */}
      {showHistorico && (
        <div className="modal-overlay">
          <div className="modal-content">
           <h2>📋 Histórico de Transações</h2>
           <input
            type="date"
            className="input-data-filtro"
            value={dataFiltro}
            onChange={(e) => aplicarFiltroData(e.target.value)}
            />

            {carregandoHistorico ? (
                <div className="loading-transacoes"></div>
                ) : (
                <ul className="historico-lista">
                    {historicoFiltrado.length > 0 ? (
                    historicoFiltrado.map((item, index) => (
                        <li className={`transacao ${item.tipo}`} key={index}>
                        <span className="transacao-icon">{item.tipo === 'recharge' ? '🟢' : '🔴'}</span>
                        <span className="descricao">
                            {item.descricao} - {item.data.split('-').reverse().join('/')}
                        </span>
                        <span className="valor">
                            {item.tipo === 'recharge' ? '+' : '-'} R$ {item.valor.toFixed(2)}
                        </span>
                        </li>
                    ))
                    ) : (
                    <li style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                        Nenhuma transação encontrada.
                    </li>
                    )}
                </ul>
            )}



            <button className="fechar" onClick={() => setShowHistorico(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );

  function formatarValor(e) {
    let valor = e.target.value;

    valor = valor.replace(/\D/g, '');

    valor = (Number(valor) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    setValorRecarga(valor);
    }

}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Login from '../Login/Login';
import "./AlunoDashboard.css";

export default function AlunoDashboard({ nome, matricula, saldo, setPage, pagamento }) {
    const [showRecarga, setShowRecarga] = useState(false);
    const [showHistorico, setShowHistorico] = useState(false);
    const [valorRecarga, setValorRecarga] = useState('');
    const [qrReady, setQrReady] = useState(false);
    const [dataFiltro, setDataFiltro] = useState('');
    const [carregandoHistorico, setCarregandoHistorico] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showQrModal, setShowQrModal] = useState(false);
    const [loadingPagamento, setLoadingPagamento] = useState(false);
    const [mensagemCredito, setMensagemCredito] = useState('');

    const qrRef = useRef(null);

    useEffect(() => {
        if (pagamento) {
            const valorNumerico = parseFloat(pagamento);
            if (!isNaN(valorNumerico) && valorNumerico > 0) {
                setMensagemCredito(`✅ Créditos de R$ ${valorNumerico.toFixed(2)} adicionados com sucesso!`);

                const timeout = setTimeout(() => {
                    setMensagemCredito('');
                }, 5000);

                return () => clearTimeout(timeout);
            }
        }
    }, [pagamento]);


    useEffect(() => {
        const timeout = setTimeout(() => setQrReady(true), 300);
        return () => clearTimeout(timeout);
    }, [matricula]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isMobile) {
            setCarregandoHistorico(true);
            const timeout = setTimeout(() => setCarregandoHistorico(false), 800);
            return () => clearTimeout(timeout);
        }
    }, [isMobile]);

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
            const timeout = setTimeout(() => setCarregandoHistorico(false), 800);
            return () => clearTimeout(timeout);
        }
    }, [showHistorico]);

    function aplicarFiltroData(novaData) {
        setDataFiltro(novaData);
        setCarregandoHistorico(true);
        setTimeout(() => setCarregandoHistorico(false), 600);
    }

    function formatarValor(e) {
        let valor = e.target.value.replace(/\D/g, '');
        valor = (Number(valor) / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
        setValorRecarga(valor);
    }

    async function iniciarPagamento() {
        setLoadingPagamento(true);

        try {
            const valorNumerico = Number(valorRecarga.replace(/[^\d]+/g, '')) / 100;
            const response = await fetch('https://lanchouapp.site/server.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valor: valorNumerico })
            });

            const data = await response.json();

            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                alert("Erro ao iniciar pagamento.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão com o servidor.");
        } finally {
            setLoadingPagamento(false);
        }
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

    return (

        <div className="dashboard-container">
            {mensagemCredito && (
                <div className="mensagem-credito">
                    {mensagemCredito}
                </div>
            )}

            <button className="btn-sair" onClick={() => setPage(<Login setPage={setPage} />)}>
                <span className="material-icons">logout</span> Sair
            </button>

            <header className="dashboard-header">
                <span className="emoji">🍔</span>
                <h2>Lanchou App</h2>
                <p>Olá, <strong>{nome}</strong>!</p>
            </header>

            {!isMobile && (
                <div className="desktop-modais" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="card saldo-card">
                        <h2><span class="material-symbols-outlined">
                            wallet
                        </span> Saldo atual</h2>
                        <p className="saldo">R$ {saldo.toFixed(2)}</p>
                    </div>

                    <div className="card qr-card" ref={qrRef}>
                        <h2><span class="material-symbols-outlined">
                            qr_code_scanner
                        </span> Seu QR Code</h2>
                        {!qrReady ? (
                            <div className="qr-loading-spinner"></div>
                        ) : (
                            <div onClick={() => setShowQrModal(true)} style={{ cursor: 'pointer' }}>
                                <QRCodeCanvas value={matricula} size={150} />
                            </div>
                        )}
                        <p className="matricula">Matrícula: <b>{matricula}</b></p>
                    </div>

                    <div className="modal-content static-modal">
                        <h2><span class="material-symbols-outlined">
                            payment_arrow_down
                        </span> Recarregar Saldo</h2>
                        <input
                            type="text"
                            placeholder="Valor em R$"
                            value={valorRecarga}
                            onChange={formatarValor}
                        />
                        <button className="confirmar" onClick={iniciarPagamento} disabled={loadingPagamento}>
                            {loadingPagamento ? "Aguarde..." : "Pagar com Mercado Pago"}
                        </button>
                    </div>

                    <div className="modal-content static-modal">
                        <h2><span class="material-symbols-outlined">
                            receipt
                        </span> Histórico de Transações</h2>
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
                    </div>
                </div>
            )}

            {/* MOBILE */}
            {isMobile && (
                <>
                    <div className="card saldo-card">
                        <h2><span class="material-symbols-outlined">
                            wallet
                        </span> Saldo atual</h2>
                        <p className="saldo">R$ {saldo.toFixed(2)}</p>
                    </div>

                    <div className="card qr-card" ref={qrRef}>
                        <h2><span class="material-symbols-outlined">
                            qr_code_scanner
                        </span> Seu QR Code</h2>
                        {!qrReady ? (
                            <div className="qr-loading-spinner"></div>
                        ) : (
                            <div onClick={() => setShowQrModal(true)} style={{ cursor: 'pointer' }}>
                                <QRCodeCanvas value={matricula} size={150} />
                            </div>
                        )}
                        <p className="matricula">Matrícula: <b>{matricula}</b></p>
                    </div>

                    <div className="card menu-opcoes">
                        <button onClick={() => setShowRecarga(true)}>Recarregar Saldo</button>
                        <button onClick={() => setShowHistorico(true)}>Ver Histórico</button>
                    </div>
                </>
            )}

            {isMobile && showRecarga && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2><span class="material-symbols-outlined">
                            payment_arrow_down
                        </span> Recarregar Saldo</h2>
                        <input
                            type="text"
                            placeholder="Valor em R$"
                            value={valorRecarga}
                            onChange={formatarValor}
                        />
                        <button className="confirmar" onClick={iniciarPagamento} disabled={loadingPagamento}>
                            {loadingPagamento ? "Aguarde..." : "Pagar com Mercado Pago"}
                        </button>
                        <button className="fechar" onClick={() => { setShowRecarga(false); setValorRecarga("") }}>Fechar</button>
                    </div>
                </div>
            )}

            {isMobile && showHistorico && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2><span class="material-symbols-outlined">
                            receipt
                        </span> Histórico de Transações</h2>
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

            {showQrModal && (
                <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
                    <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
                        <h2><span class="material-symbols-outlined">
                            qr_code_scanner
                        </span> QR Code</h2>
                        <QRCodeCanvas value={matricula} size={250} />
                        <p className="matricula">Matrícula: <b>{matricula}</b></p>
                        <button className="fechar" onClick={() => setShowQrModal(false)}>Fechar</button>
                    </div>
                </div>
            )}
        </div>

    );
} ''
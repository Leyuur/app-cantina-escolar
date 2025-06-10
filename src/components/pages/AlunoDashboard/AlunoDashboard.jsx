import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Login from '../Login/Login';
import "./AlunoDashboard.css";
import logoPix from '../../../img/logo-pix.png';
import logoMercadoPago from '../../../img/logo-mercadopago.png';
import { toast } from 'react-toastify';
import Loading from '../../tools/Loading/Loading';
import Pix from '../Pagamento/Pix';
import { getHistorico } from '../../tools/functions.js';

export default function AlunoDashboard({ setPage }) {
    const [showRecarga, setShowRecarga] = useState(false);
    const [showHistorico, setShowHistorico] = useState(false);
    const [valorRecarga, setValorRecarga] = useState('');
    const [qrReady, setQrReady] = useState(false);
    const [dataFiltro, setDataFiltro] = useState('');
    const [carregandoHistorico, setCarregandoHistorico] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showQrModal, setShowQrModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pixData, setPixData] = useState(null);
    const [usuario, setUsuario] = useState(null)


    const qrRef = useRef(null);

    const [searchParams] = useSearchParams();
    const recarga = searchParams.get("recarga");

    useEffect(() => {
        if (recarga && !isNaN(recarga) && recarga > 0) {
            toast.success(`R$ ${parseFloat(recarga).toFixed(2)} em créditos adicionados com sucesso!`);
        }
    }, [recarga]);

    useEffect(() => {
        if (!usuario) return;
        const timeout = setTimeout(() => setQrReady(true), 300);
        return () => clearTimeout(timeout);
    }, [usuario]);


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
    }, [usuario]);

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
        setLoading(true);

        try {
            const valorNumerico = Number(valorRecarga.replace(/[^\d]+/g, '')) / 100;

            if (valorNumerico <= 1) {
                throw new Error("Você deve inserir um valor acima de R$ 1,00")
            }
            const response = await fetch('https://lanchouapp.site/endpoints/server.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valor: valorNumerico, tipo: 'checkout' })
            });

            const data = await response.json();

            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                toast.error("Erro ao iniciar pagamento.");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function iniciarPagamentoPix() {
        setLoading(true);
        try {
            const valorNumerico = Number(valorRecarga.replace(/[^\d]+/g, '')) / 100;
            if (valorNumerico <= 1) {
                throw new Error("Você deve inserir um valor acima de R$ 1,00");
            }

            const response = await fetch('https://lanchouapp.site/endpoints/server.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valor: valorNumerico, tipo: 'pix' })
            });

            const data = await response.json();

            if (data.qr_code_base64 && data.qr_code && data.id) {
                setPixData({
                    img: data.qr_code_base64,
                    caminho: data.qr_code,
                    statusUrl: `https://lanchouapp.site/endpoints/status.php?id=${data.id}`,
                    id: data.id
                });
            } else {
                toast.error("Erro ao gerar QR Code do Pix.");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const user = localStorage.getItem("usuario");
        if (user) {
            setUsuario(JSON.parse(user));

            console.log(user)
        } else {
            setPage(<Login setPage={setPage} />);
        }
    }, []);


    // const historico = await getHistorico(usuario)
    
    if (!usuario || !historico) return <Loading />;

    const historico = [
        { descricao: "teste", data: "12/06/2025" }
    ]

    const historicoFiltrado = dataFiltro
        ? historico.filter((item) => item.data === dataFiltro)
        : historico;

    return (
        <div className="dashboard-container">

            <button className="btn-sair" onClick={() => {
                localStorage.removeItem("usuario")
                setPage(<Login setPage={setPage} />)
                toast.error("Deslogado com sucesso!")
            }}>
                <span className="material-icons">logout</span> Sair
            </button>

            <header className="dashboard-header">
                <span className="emoji">🍔</span>
                <h2>Lanchou App</h2>
                <p>Olá, <strong>{usuario.nome}</strong>!</p>
            </header>

            {!isMobile && (
                <div className="desktop-modais" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="card saldo-card">
                        <h2><span class="material-symbols-outlined">
                            wallet
                        </span> Saldo atual</h2>
                        <p className="saldo">R$ {usuario.saldo}</p>
                    </div>

                    <div className="card qr-card" ref={qrRef}>
                        <h2><span class="material-symbols-outlined">
                            qr_code_scanner
                        </span> Seu QR Code</h2>
                        {!qrReady ? (
                            <div className="qr-loading-spinner"></div>
                        ) : (
                            <div onClick={() => setShowQrModal(true)} style={{ cursor: 'pointer' }}>
                                <QRCodeCanvas value={usuario.matricula} size={150} />
                            </div>
                        )}
                        <p className="matricula">Matrícula: <b>{usuario.matricula}</b></p>
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
                        <div className="pagamento-botoes">
                            <button className="btn-mercado-pago" onClick={iniciarPagamento} disabled={loading}>
                                <img src={logoMercadoPago} alt="Mercado Pago" />
                                MercadoPago
                            </button>
                            <button className="btn-pix" onClick={iniciarPagamentoPix} disabled={loading}>
                                <img src={logoPix} alt="Pix" />
                                Pix
                            </button>
                        </div>

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
                                                {item.tipo === 'recharge' ? '+' : '-'} R$ {item.valor}
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
                        <p className="saldo">R$ {usuario.saldo}</p>
                    </div>

                    <div className="card qr-card" ref={qrRef}>
                        <h2><span class="material-symbols-outlined">
                            qr_code_scanner
                        </span> Seu QR Code</h2>
                        {!qrReady ? (
                            <div className="qr-loading-spinner"></div>
                        ) : (
                            <div onClick={() => setShowQrModal(true)} style={{ cursor: 'pointer' }}>
                                <QRCodeCanvas value={usuario.matricula} size={150} />
                            </div>
                        )}
                        <p className="matricula">Matrícula: <b>{usuario.matricula}</b></p>
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
                        <div className="pagamento-botoes">
                            <button className="btn-mercado-pago" onClick={iniciarPagamento} disabled={loading}>
                                <img src={logoMercadoPago} alt="Mercado Pago" />
                                {loading ? "Aguarde..." : "Mercado Pago"}
                            </button>
                            <button className="btn-pix" onClick={iniciarPagamentoPix} disabled={loading}>
                                <img src={logoPix} alt="Pix" />
                                {loading ? "Aguarde..." : "Pix"}
                            </button>
                        </div>

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
                                                {item.tipo === 'recharge' ? '+' : '-'} R$ {item.valor}
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
                        <QRCodeCanvas value={usuario.matricula} size={250} />
                        <p className="matricula">Matrícula: <b>{usuario.matricula}</b></p>
                        <button className="fechar" onClick={() => setShowQrModal(false)}>Fechar</button>
                    </div>
                </div>
            )}

            {pixData && (
                <Pix
                    img={pixData.img}
                    caminho={pixData.caminho}
                    statusUrl={pixData.statusUrl}
                    idPagamento={pixData.id} // 👈 importante!
                    onConfirm={(valor) => {
                        toast.success(`R$ ${valor.toFixed(2)} adicionados com sucesso!`);
                        setPixData(null);
                        setValorRecarga('');
                    }}
                    onClose={() => {
                        setPixData(null)
                        toast.error("Transação cancelada.")
                    }} // ✅ FECHAR MODAL
                />
            )}



            {loading && (
                <Loading />
            )}
        </div>

    );
} ''
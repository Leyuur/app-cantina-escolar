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
import { creditar } from '../../tools/functions.js';
import logoLanchouLaranja from '../../../img/LANCHOU APP LARANJA.png'

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
    const [saldo, setSaldo] = useState(0)
    const [novoCredito, setNovoCredito] = useState(null)
    const [showCartao, setShowCartao] = useState(false);
    const [historico, setHistorico] = useState([]);

    const qrRef = useRef(null);

    const [searchParams] = useSearchParams();

    const aplicarCredito = async (valorManual = null) => {
        const recarga = valorManual || searchParams.get("recarga");

        if (recarga && !isNaN(recarga) && recarga > 0) {
            try {
                setLoading(true);
                const recarregado = await creditar(usuario.matricula, recarga);
                if (recarregado) {
                    const userAtualizado = { ...usuario, saldo: recarregado };
                    localStorage.setItem("usuario", JSON.stringify(userAtualizado));
                    setUsuario(userAtualizado);
                    setSaldo(recarregado);
                    setValorRecarga("")
                    toast.success(`R$ ${parseFloat(recarga).toFixed(2)} em créditos adicionados com sucesso!`);
                } else {
                    throw new Error("Erro ao adicionar os créditos. Fale com um ADM.");
                }
            } catch (error) {
                console.error(error);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const recarga = searchParams.get("recarga");
        if (recarga) setNovoCredito(recarga);
    }, []);

    useEffect(() => {
        if (!novoCredito) return;
        let valor = parseFloat(novoCredito);
        if (!isNaN(valor) && valor > 0) {
            aplicarCredito(valor);
            setNovoCredito(null);
        }
    }, [novoCredito, searchParams, usuario]);

    useEffect(() => {
        if (!usuario) return;

        const carregarHistorico = async () => {
            try {
                const res = await fetch("https://lanchouapp.site/endpoints/listar_compras.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ matricula: usuario.matricula })
                });
                const data = await res.json();
                setHistorico(data);
            } catch (err) {
                console.error("Erro ao carregar histórico:", err);
            }
        };

        carregarHistorico();
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
        if (usuario) {
            setQrReady(true);
        }
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

    const iniciarPagamento = async () => {
        if (!showCartao) return;

        // Clean previous instances
        document.querySelectorAll('[id^="form-checkout"]').forEach(el => el.remove());
        document.querySelectorAll('script[src*="mercadopago"]').forEach(el => el.remove());

        const valorNumerico = Number(valorRecarga.replace(/[^\d]+/g, '')) / 100;
        if (valorNumerico <= 1) {
            toast.error("Você deve inserir um valor acima de R$ 1,00");
            setShowCartao(false);
            return;
        }

        const checkPaymentStatus = async (id) => {
            try {
                const response = await fetch(`https://lanchouapp.site/endpoints/status.php?id=${id}`);
                const data = await response.json();

                if (data.status === 'approved') {
                    toast.success("Pagamento aprovado!");
                    setNovoCredito(valorNumerico);
                    setShowCartao(false);
                    clearInterval(pollingInterval.current);
                } else if (data.status === 'rejected') {
                    toast.error(`Pagamento recusado: ${data.motivo || 'Motivo desconhecido'}`);
                    clearInterval(pollingInterval.current);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                clearInterval(pollingInterval.current);
                setLoading(false);
            }
        };

        const pollingInterval = useRef(null);

        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";

        script.onload = async () => {
            try {
                const mp = new window.MercadoPago("APP_USR-c90a2f9e-b93b-4221-833b-e7adba2b9750", {
                    locale: "pt-BR",
                    advancedFraudPrevention: true
                });

                const cardForm = mp.cardForm({
                    amount: valorNumerico.toString(),
                    autoMount: true,
                    form: {
                        id: "form-checkout",
                        cardholderName: {
                            id: "form-checkout__cardholderName",
                            placeholder: "Nome no cartão"
                        },
                        cardholderEmail: {
                            id: "form-checkout__cardholderEmail",
                            placeholder: "E-mail"
                        },
                        cardNumber: {
                            id: "form-checkout__cardNumber",
                            placeholder: "Número do cartão"
                        },
                        expirationDate: {
                            id: "form-checkout__expirationDate",
                            placeholder: "MM/AA"
                        },
                        securityCode: {
                            id: "form-checkout__securityCode",
                            placeholder: "CVV"
                        },
                        installments: {
                            id: "form-checkout__installments",
                            placeholder: "Parcelas"
                        },
                        identificationType: {
                            id: "form-checkout__identificationType",
                            placeholder: "Tipo documento"
                        },
                        identificationNumber: {
                            id: "form-checkout__identificationNumber",
                            placeholder: "Número documento"
                        },
                        issuer: {
                            id: "form-checkout__issuer",
                            placeholder: "Banco emissor"
                        },
                    },
                    callbacks: {
                        onFormMounted: error => {
                            if (error) {
                                console.error('Form mount error:', error);
                                toast.error("Erro ao configurar o formulário");
                                return;
                            }
                        },
                        onSubmit: async (event) => {
                            event.preventDefault();
                            setLoading(true);
                            toast.info("Processando pagamento...");

                            try {
                                const formData = cardForm.getCardFormData();
                                const response = await fetch("https://lanchouapp.site/endpoints/server.php", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        tipo: "cartao",
                                        valor: valorNumerico,
                                        ...formData
                                    })
                                });

                                const data = await response.json();

                                if (data.id) {
                                    pollingInterval.current = setInterval(() => {
                                        checkPaymentStatus(data.id);
                                    }, 3000);
                                } else {
                                    throw new Error("Pagamento não iniciado corretamente");
                                }
                            } catch (err) {
                                console.error('Payment error:', err);
                                toast.error("Erro ao processar pagamento");
                                setLoading(false);
                            }
                        },
                        onError: (error) => {
                            console.error('MercadoPago error:', error);
                            toast.error(`Erro: ${error.message || 'Erro no pagamento'}`);
                            setLoading(false);
                        }
                    }
                });
            } catch (error) {
                console.error('Initialization error:', error);
                toast.error("Falha ao iniciar pagamento");
            }
        };

        script.onerror = () => {
            toast.error("Falha ao carregar serviço de pagamentos");
        };

        document.body.appendChild(script);

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    };

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
            const parsedUser = JSON.parse(user);
            setUsuario(parsedUser);
            setSaldo(parsedUser.saldo);
            console.log(parsedUser);
        } else {
            setPage(<Login setPage={setPage} />);
        }
    }, []);

    if (!usuario || !historico) return <Loading />;

    const historicoFiltrado = dataFiltro
        ? historico.filter((item) => item.data === dataFiltro)
        : historico;

    return (
        <div className="dashboard-container">
            <button className="btn-sair" onClick={() => {
                localStorage.removeItem("usuario");
                setPage(<Login setPage={setPage} />);
                toast.error("Deslogado com sucesso!");
            }}>
                <span className="material-icons">logout</span> Sair
            </button>

            <header className="dashboard-header">
                <img className="logo-lanchou" src={logoLanchouLaranja} alt='Logo Lanchou'></img>
                <p>Olá, <strong>{usuario.nome}</strong>!</p>
            </header>

            {!isMobile && (
                <div className="desktop-modais" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="card saldo-card">
                        <h2><span className="material-symbols-outlined">wallet</span> Saldo atual</h2>
                        <p className="saldo">R$ {saldo.toFixed(2)}</p>
                    </div>

                    <div className="card qr-card" ref={qrRef}>
                        <h2><span className="material-symbols-outlined">qr_code_scanner</span> Seu QR Code</h2>
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
                        <h2><span className="material-symbols-outlined">payment_arrow_down</span> Recarregar Saldo</h2>
                        <input
                            type="text"
                            placeholder="Valor em R$"
                            value={valorRecarga}
                            onChange={formatarValor}
                        />
                        <div className="pagamento-botoes">
                            {/* <button className="btn-cartao" onClick={() => setShowCartao(true)} disabled={loading}>
                                <span className="material-icons">credit_card</span> Cartão de Crédito
                            </button> */}

                            <button className="btn-pix" onClick={iniciarPagamentoPix} disabled={loading}>
                                <img src={logoPix} alt="Pix" />
                                Pix
                            </button>
                        </div>
                    </div>

                    <div className="modal-content static-modal">
                        <h2><span className="material-symbols-outlined">receipt</span> Histórico de Transações</h2>
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
                                        <li className={`transacao ${item.tipo} tooltip`} title={item.id} key={index}>
                                            <span className="tooltip-text"><b>Id da compra:</b> {item.id}</span>
                                            <span className="transacao-icon">{item.tipo === 'Recarga' ? '🟢' : '🔴'}</span>
                                            <span className="descricao">
                                                {item.descricao} - {item.data.split('-').reverse().join('/')}
                                            </span>
                                            <span className="valor">
                                                {item.tipo === 'Recarga' ? '+' : '-'} R$ {Math.abs(parseFloat(item.valor)).toFixed(2).replace('.', ',')}
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

            {isMobile && (
                <>
                    <div className="card saldo-card">
                        <h2><span className="material-symbols-outlined">wallet</span> Saldo atual</h2>
                        <p className="saldo">R$ {usuario.saldo}</p>
                    </div>

                    <div className="card qr-card" ref={qrRef}>
                        <h2><span className="material-symbols-outlined">qr_code_scanner</span> Seu QR Code</h2>
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
                        <h2><span className="material-symbols-outlined">payment_arrow_down</span> Recarregar Saldo</h2>
                        <input
                            type="text"
                            placeholder="Valor em R$"
                            value={valorRecarga}
                            onChange={formatarValor}
                        />
                        <div className="pagamento-botoes">
                            {/* <button className="btn-cartao" onClick={() => setShowCartao(true)} disabled={loading}>
                                <span className="material-icons">credit_card</span> Cartão de Crédito
                            </button> */}

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
                        <h2><span className="material-symbols-outlined">receipt</span> Histórico de Transações</h2>
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
                                        <li className={`transacao ${item.tipo} tooltip`} key={index}>
                                            <span className="tooltip-text">Id da compra: {item.id}</span>
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
                        <h2><span className="material-symbols-outlined">qr_code_scanner</span> QR Code</h2>
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
                    idPagamento={pixData.id}
                    onConfirm={(valor) => {
                        setNovoCredito(valor);
                        setPixData(null);
                    }}
                    onClose={() => {
                        setPixData(null);
                        toast.error("Transação cancelada.");
                    }}
                />
            )}

            {showCartao && (
                <div className="modal-overlay">
                    <div className="modal-content modal-cartao">
                        <h2><span className="material-symbols-outlined">credit_card</span> Cartão de Crédito</h2>
                        <form id="form-checkout">
                            <input type="text" id="form-checkout__cardholderName" placeholder="Nome impresso no cartão" />
                            <input type="email" id="form-checkout__cardholderEmail" placeholder="E-mail" />
                            <input type="text" id="form-checkout__cardNumber" placeholder="Número do cartão" />
                            <input type="text" id="form-checkout__expirationDate" placeholder="Data de expiração (MM/AA)" />
                            <input type="text" id="form-checkout__securityCode" placeholder="Código de segurança" />
                            <select id="form-checkout__installments"></select>
                            <select id="form-checkout__identificationType"></select>
                            <input type="text" id="form-checkout__identificationNumber" placeholder="CPF" />
                            <select id="form-checkout__issuer"></select>
                            <button type="submit" className="confirmar" onClick={(e) => {
                                e.preventDefault();
                                iniciarPagamento();
                            }}>Pagar</button>
                        </form>
                        <button className="fechar" onClick={() => setShowCartao(false)}>Fechar</button>
                    </div>
                </div>
            )}

            {loading && <Loading />}
        </div>
    );
}
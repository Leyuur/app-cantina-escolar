import { useState, useEffect, useRef } from 'react';
import './AdmDashboard.css';
import Login from '../Login/Login';
import { Html5QrcodeScanner } from 'html5-qrcode';
import logoLanchouLaranja from '../../../img/LANCHOU APP LARANJA.png'

export default function AdmDashboard({ nomeAdmin, setPage }) {
    const [historico, setHistorico] = useState([]);
    const [showHistorico, setShowHistorico] = useState(false);
    const [showCadastro, setShowCadastro] = useState(false);
    const [showCadastroFuncionario, setShowCadastroFuncionario] = useState(false);
    const [showLoginLogs, setShowLoginLogs] = useState(false);
    const [showPagamentoLogs, setShowPagamentoLogs] = useState(false);
    const [showDesconto, setShowDesconto] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [matricula, setMatricula] = useState('');
    const [dataFiltro, setDataFiltro] = useState('');
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const [carregandoLoginLog, setCarregandoLoginLog] = useState(true);
    const [carregandoPagamentoLog, setCarregandoPagamentoLog] = useState(true);
    const [qrError, setQrError] = useState('');
    const [valorDesconto, setValorDesconto] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const qrRef = useRef(null);

    const loginLogs = [
        '[2025-06 - 16 20: 25: 43] Raw input recebido: { "user": "00000", "senha": "123" }',
        '[2025-06 - 16 20: 25: 43] Tentando login com: user =00000, senha = 123',
        '[2025-06 - 16 20: 25: 43] Login bem - sucedido para 00000',
        '[2025-06 - 16 20: 26: 42] Raw input recebido: { "user": "admin", "senha": "admin" }',
        '[2025-06 - 16 20: 26: 42] Tentando login com: user = admin, senha = admin',
        '[2025-06 - 16 20: 26: 42] Login falhou: usuário ou senha incorretos.',
    ]
    const pagamentoLogs = [
        '[2025-07-01 09:08: 58] Raw input recebido: { "matricula": "00000", "credito": 1.02 }',
        '[2025-07-01 09:08: 58] Tentando adicionar saldo de R$ 1.02 para usuário 00000.',
        '[2025-07-01 09:08: 58] Compra registrada para 00000: R$ 1.02 - Crédito adicionado',
        '[2025-07-01 09:08: 58] Saldo atualizado com sucesso para 00000.Novo saldo: R$ 4.05.',
        '[2025-07-01 09: 23: 14] Raw input recebido: { "matricula": "33333", "credito": 1.01 }',
        '[2025-07-01 09: 23: 14] Tentando adicionar saldo de R$ 1.01 para usuário 33333.',
        '[2025-07-01 09: 23: 14] Compra registrada para 33333: R$ 1.01 - Crédito adicionado',
        '[2025-07-01 09: 23: 14] Saldo atualizado com sucesso para 33333. Novo saldo: R$ 1.01.',
    ]

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (showQrModal) {
            const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
            scanner.render(
                (decodedText) => {
                    setMatricula(decodedText);
                    setShowQrModal(false);
                    setQrError('');
                    scanner.clear();
                },
                (errorMessage) => {
                    console.warn(errorMessage);
                }
            );
            return () => {
                scanner.clear().catch(() => { });
            };
        }
    }, [showQrModal]);

    useEffect(() => {
        const carregarHistorico = async () => {
            try {
                const res = await fetch("https://lanchouapp.site/endpoints/listar_compras.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "todasCompras": true })
                });
                const data = await res.json();
                setHistorico(data);
            } catch (err) {
                console.error("Erro ao carregar histórico:", err);
            }
        };

        carregarHistorico();
    }, []);

    const historicoFiltrado = dataFiltro
        ? historico.filter((item) => item.data === dataFiltro)
        : historico;

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
        setValorDesconto(valor);
    }

    setTimeout(() => {
        setCarregandoLoginLog(false)
        setTimeout(() => {
            setCarregandoPagamentoLog(false)
        }, 200)
    }, 1000)

    return (
        <div className="dashboard-container">
            <button className="btn-sair" onClick={() => {
                localStorage.removeItem("usuario")
                localStorage.removeItem("adm")
                setPage(<Login setPage={setPage} />)
            }}>
                <span className="material-icons">logout</span> Sair
            </button>

            <header className="dashboard-header">
                <img className="logo-lanchou" src={logoLanchouLaranja}></img>
                <h2>Painel de Adm</h2>
                <p>Olá, <strong>{" " + nomeAdmin}</strong>!</p>
            </header>

            <div className="card resumo-card" style={{ marginBottom: "1rem" }}>
                <h3><span className="material-icons">bar_chart</span> Resumo</h3>
                <p>Total de alunos: <b>25</b></p>
                <p>Total de funcionários: <b>2</b></p>
                <p>Saldo total circulante: <b>R$ 740,00</b></p>
            </div>

            {isMobile && (
                <div className="card menu-opcoes">
                    <button onClick={() => setShowCadastro(true)}>Cadastrar Aluno</button>
                    <button onClick={() => setShowCadastroFuncionario(true)}>Cadastrar Funcionário</button>
                    <button onClick={() => setShowDesconto(true)}>Descontar Saldo</button>
                    <button onClick={() => setShowHistorico(true)}>Ver Histórico Geral</button>
                    <button onClick={() => setShowLoginLogs(true)}>Ver Logs de Login</button>
                    <button onClick={() => setShowPagamentoLogs(true)}>Ver Logs de Pagamento</button>
                </div>
            )}

            {!isMobile && (
                <div className="desktop-modais" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    {(isMobile ? showCadastro : true) && (
                        <div className="modal-content static-modal">
                            <h2><span className="material-icons">school</span> Cadastrar Aluno</h2>
                            <input type="text" placeholder="Nome do aluno" />
                            <input type="text" placeholder="Matrícula" />
                            <input type="text" placeholder="Senha" />
                            <button className="confirmar">Cadastrar</button>
                        </div>
                    )}

                    {(isMobile ? showCadastro : true) && (
                        <div className="modal-content static-modal">
                            <h2 style={{fontSize: "1.4vw"}}><span className="material-icons">badge</span> Cadastrar Funcionário</h2>
                            <input type="text" placeholder="Nome do funcionário" />
                            <input type="text" placeholder="Login" />
                            <input type="text" placeholder="Senha" />
                            <button className="confirmar">Cadastrar</button>
                        </div>
                    )}

                    {(isMobile ? showDesconto : true) && (
                        <div className="modal-content static-modal">
                            <h2><span className="material-icons">remove_circle_outline</span> Descontar Saldo</h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Matrícula do aluno"
                                    value={matricula}
                                    onChange={(e) => setMatricula(e.target.value)}
                                />
                                <button onClick={() => setShowQrModal(true)}>
                                    <span className="material-icons">qr_code_scanner</span> Ler QR Code
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Valor (R$)"
                                value={valorDesconto}
                                onChange={formatarValor}
                            />
                            <input type="text" placeholder="Descrição da compra" />
                            <button className="confirmar">Confirmar Desconto</button>
                        </div>
                    )}

                    {(isMobile ? showHistorico : true) && (
                        <div className="modal-content static-modal">
                            <h2 style={{fontSize: "1.4vw"}}><span className="material-icons">receipt_long</span> Histórico de Transações</h2>
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
                                                <span className="tooltip-text"><b>Id da compra:</b> {item.id}<br /><b>Usuário:</b> {item.matricula}</span>
                                                {item.tipo === 'Recarga' ? '🟢' : '🔴'}
                                                <span className="descricao">{item.descricao} - {item.data.split('-').reverse().join('/')}</span>
                                                <span className="valor">{item.tipo === 'Recarga' ? '+' : '-'} R$ {item.valor}</span>
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
                    )}

                    {(isMobile ? showLoginLogs : true) && (
                            <div className="modal-content static-modal">
                                <h2><span className="material-icons">history</span> Logs de Login</h2>
                                {carregandoLoginLog ? (
                                    <div className="loading-transacoes"></div>
                                ) : (
                                    <ul className="historico-lista" style={{maxHeight: "200px", overflow: "auto", textAlign: "center"}}>
                                        {loginLogs.length > 0 ? (
                                            loginLogs.map((item, index) => (
                                                <li className={`transacao ${item}`} key={index}>
                                                    <span className="descricao">{item}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                                                Nenhum log encontrado.
                                            </li>
                                        )}
                                    </ul>
                                )}
                                <button className="fechar" onClick={() => setShowLoginLogs(false)}>Fechar</button>
                            </div>
                    )}

                    {(isMobile ? showPagamentoLogs : true) && (
                            <div className="modal-content static-modal" onClick={() => setShowPagamentoLogs(true)}>
                                <h2><span className="material-icons">history</span> Logs de Pagamentos</h2>
                                {carregandoPagamentoLog ? (
                                    <div className="loading-transacoes"></div>
                                ) : (
                                    <ul className="historico-lista" style={{maxHeight: "200px", overflow: "auto", textAlign: "center"}}>
                                        {pagamentoLogs.length > 0 ? (
                                            pagamentoLogs.map((item, index) => (
                                                <li className={`transacao ${item}`} key={index}>
                                                    <span className="tooltip-text">{item}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                                                NNenhum log encontrado.
                                            </li>
                                        )}
                                    </ul>
                                )}
                                <button className="fechar" onClick={() => setShowPagamentoLogs(false)}>Fechar</button>
                            </div>
                    )}
                </div>
            )}

            

            {isMobile && (showCadastro || showCadastroFuncionario || showDesconto || showHistorico || showLoginLogs || showPagamentoLogs) && (
                <>
                    {showCadastro && (
                        <div className="modal-overlay">
                            <div className="modal-content static-modal">
                                <h2><span className="material-icons">school</span> Cadastrar Aluno</h2>
                                <input type="text" placeholder="Nome do aluno" />
                                <input type="text" placeholder="Matrícula" />
                                <input type="text" placeholder="Senha" />
                                <button className="confirmar">Cadastrar</button>
                                <button className="fechar" onClick={() => setShowCadastro(false)}>Fechar</button>
                            </div>
                        </div>
                    )}

                    {showCadastroFuncionario && (
                        <div className="modal-overlay">
                            <div className="modal-content static-modal">
                                <h2><span className="material-icons">badge</span> Cadastrar Funcionário</h2>
                                <input type="text" placeholder="Nome do funcionário" />
                                <input type="text" placeholder="Login" />
                                <input type="text" placeholder="Senha" />
                                <button className="confirmar">Cadastrar</button>
                                <button className="fechar" onClick={() => setShowCadastroFuncionario(false)}>Fechar</button>
                            </div>
                        </div>
                    )}

                    {showDesconto && (
                        <div className="modal-overlay">
                            <div className="modal-content static-modal">
                                <h2><span className="material-icons">remove_circle_outline</span> Descontar Saldo</h2>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Matrícula do aluno"
                                        value={matricula}
                                        onChange={(e) => setMatricula(e.target.value)}
                                    />
                                    <button onClick={() => setShowQrModal(true)}>
                                        <span className="material-icons">qr_code_scanner</span> Ler QR Code
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Valor (R$)"
                                    value={valorDesconto}
                                    onChange={formatarValor}
                                />
                                <input type="text" placeholder="Descrição da compra" />
                                <button className="confirmar">Confirmar Desconto</button>
                                <button className="fechar" onClick={() => setShowDesconto(false)}>Fechar</button>
                            </div>
                        </div>
                    )}

                    {showHistorico && (
                        <div className="modal-overlay">
                            <div className="modal-content static-modal">
                                <h2><span className="material-icons">receipt_long</span> Histórico de Transações</h2>
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
                                                    <span className="tooltip-text"><b>Id da compra:</b> {item.id}<br /><b>Usuário:</b> {item.matricula}</span>
                                                    {item.tipo === 'Recarga' ? '🟢' : '🔴'}
                                                    <span className="descricao">{item.descricao} - {item.data.split('-').reverse().join('/')}</span>
                                                    <span className="valor">{item.tipo === 'Recarga' ? '+' : '-'} R$ {item.valor}</span>
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

                    {showLoginLogs && (
                        <div className="modal-overlay">
                            <div className="modal-content static-modal">
                                <h2><span className="material-icons">receipt_long</span> Logs de Login</h2>
                                {carregandoLoginLog ? (
                                    <div className="loading-transacoes"></div>
                                ) : (
                                    <ul className="historico-lista" style={{maxHeight: "70vh", overflow: "auto"}}>
                                        {loginLogs.length > 0 ? (
                                            loginLogs.map((item, index) => (
                                                <li className={`transacao ${item}`} key={index}>
                                                    <span className="descricao">{item}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                                                Nenhum log encontrado.
                                            </li>
                                        )}
                                    </ul>
                                )}
                                <button className="fechar" onClick={() => setShowLoginLogs(false)}>Fechar</button>
                            </div>
                        </div>
                    )}

                    {showPagamentoLogs && (
                        <div className="modal-overlay">
                            <div className="modal-content static-modal">
                                <h2><span className="material-icons">receipt_long</span> Logs de Pagamentos</h2>
                                {carregandoPagamentoLog ? (
                                    <div className="loading-transacoes"></div>
                                ) : (
                                    <ul className="historico-lista" style={{maxHeight: "70vh", overflow: "auto"}}>
                                        {pagamentoLogs.length > 0 ? (
                                            pagamentoLogs.map((item, index) => (
                                                <li className={`transacao ${item}`} key={index}>
                                                    <span className="tooltip-text">{item}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                                                NNenhum log encontrado.
                                            </li>
                                        )}
                                    </ul>
                                )}
                                <button className="fechar" onClick={() => setShowPagamentoLogs(false)}>Fechar</button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {showQrModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: "400px" }}>
                        <h2><span className="material-icons">qr_code_scanner</span> Leitor de QR Code</h2>
                        <div id="qr-reader" ref={qrRef} style={{ width: '100%' }}></div>
                        <button className="fechar qrcode-fechar" onClick={() => {
                            setShowQrModal(false);
                            setQrError('');
                        }}>Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

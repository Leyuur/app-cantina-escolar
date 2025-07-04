import { useState, useEffect, useRef } from 'react';
import './FuncDashboard.css';
import Login from '../Login/Login';
import { Html5QrcodeScanner } from 'html5-qrcode';
import logoLanchouLaranja from '../../../img/LANCHOU APP LARANJA.png'
import { toast } from 'react-toastify';
import Loading from '../../tools/Loading/Loading';

export default function FuncDashboard({ nomeFunc, setPage }) {
    const [historico, setHistorico] = useState([]);
    const [showHistorico, setShowHistorico] = useState(false);
    const [showDesconto, setShowDesconto] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [confirmarDescontoModal, setConfirmarDescontoModal] = useState(false);
    const [matricula, setMatricula] = useState('');
    const [dataFiltro, setDataFiltro] = useState('');
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const [qrError, setQrError] = useState('');
    const [valorDesconto, setValorDesconto] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const qrRef = useRef(null);
    const [totalAlunos, setTotalAlunos] = useState(0);
    const [saldoTotal, setSaldoTotal] = useState(0.0);
    const [loading, setLoading] = useState(false);
    const [itens, setItens] = useState([]);
    const [itensSelecionados, setItensSelecionados] = useState([]);
    const [showAdicionarItemModal, setShowAdicionarItemModal] = useState(false);

    useEffect(() => {
        async function carregarItens() {
            try {
                const res = await fetch("https://lanchouapp.site/endpoints/listar_itens.php");
                const data = await res.json();
                if (!data.error) {
                    setItens(data);
                }
            } catch (err) {
                console.error("Erro ao carregar itens:", err);
            }
        }

        carregarItens();
    }, []);


    useEffect(() => {
        async function buscarResumo() {
            try {
                const res = await fetch('https://lanchouapp.site/endpoints/resumo_dashboard.php');
                const data = await res.json();
                if (!data.error) {
                    setTotalAlunos(data.totalAlunos);
                    setSaldoTotal(data.saldoTotal);
                } else {
                    console.error(data.error);
                }
            } catch (err) {
                console.error('Erro ao buscar resumo:', err);
            }
        }

        buscarResumo();
    }, []);


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

    async function carregarHistorico() {
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
    }

    useEffect(() => {
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
                <h2>Painel da Cantina</h2>
                <p>Olá, <strong>{nomeFunc}</strong>!</p>
            </header>


            <div className="card resumo-card" style={{ marginBottom: "1rem" }}>
                <h3><span className="material-icons">bar_chart</span> Resumo</h3>
                <p>Total de alunos: <b>{totalAlunos}</b></p>
                <p>Saldo total circulante: <b>R$ {saldoTotal.toFixed(2).replace('.', ',')}</b></p>
            </div>

            {!isMobile && (
                <button className="btn-cartao" onClick={() => setShowAdicionarItemModal(true)} style={{ marginBottom: "5px" }}>
                    <span className="material-icons">add</span> Novo Item
                </button>
            )}

            {isMobile && (
                <div className="card menu-opcoes">
                    <button onClick={() => setShowAdicionarItemModal(true)}>Adicionar Novo Item</button>
                    <button onClick={() => setShowDesconto(true)}>Descontar Saldo</button>
                    <button onClick={() => setShowHistorico(true)}>Ver Histórico Geral</button>
                </div>
            )}

            {!isMobile && (
                <div className="desktop-modais" style={{ gridTemplateColumns: "1fr 1fr" }}>

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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "1rem" }}>
                                <h4>Itens Selecionados:</h4>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', margin: "1rem 0", maxHeight: "200px", overflowY: "auto" }}>
                                {itens.map((item, index) => (
                                    <button
                                        key={index}
                                        className="btn-cartao"
                                        style={{
                                            background: itensSelecionados.includes(item) ? "#e65c00" : "#ff6f00"
                                        }}
                                        onClick={() => {
                                            const index = itensSelecionados.findIndex(i => i.id === item.id);
                                            if (index !== -1) {
                                                const novaLista = [...itensSelecionados];
                                                novaLista[index].quantidade += 1;
                                                setItensSelecionados(novaLista);
                                            } else {
                                                setItensSelecionados([...itensSelecionados, { ...item, quantidade: 1 }]);
                                            }

                                        }}
                                    >
                                        {item.nome} - R$ {item.preco.toFixed(2).replace('.', ',')}
                                    </button>
                                ))}
                                {itensSelecionados.map((item, index) => (
                                    <div key={index} className="item-selecionado">
                                        <span>{item.nome}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <button onClick={() => {
                                                const novaLista = [...itensSelecionados];
                                                novaLista[index].quantidade -= 1;
                                                if (novaLista[index].quantidade <= 0) {
                                                    novaLista.splice(index, 1);
                                                }
                                                setItensSelecionados(novaLista);
                                            }}>-</button>
                                            <span>{item.quantidade}</span>
                                            <button onClick={() => {
                                                const novaLista = [...itensSelecionados];
                                                novaLista[index].quantidade += 1;
                                                setItensSelecionados(novaLista);
                                            }}>+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p><b>Total:</b> R$ {itensSelecionados.reduce((total, item) => total + item.preco, 0).toFixed(2).replace('.', ',')}</p>

                            <button
                                className="confirmar"
                                onClick={() => {
                                    if (matricula && valorDesconto && itensSelecionados.length > 0) {
                                        setConfirmarDescontoModal(true);
                                    } else {
                                        toast.error("Você deve preencher todos os campos.")
                                    }
                                }}
                            >
                                Confirmar Desconto
                            </button>

                        </div>
                    )}

                    {(isMobile ? showHistorico : true) && (
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
                                            <li className={`transacao ${item.tipo} tooltip`} key={index} title={`Id da transação: ${item.id} Usuário: ${item.matricula}`}>
                                                <span className="tooltip-text"><b>Id da transação:</b> {item.id}<br /><b>Usuário:</b> {item.matricula}</span>
                                                {item.tipo === 'Recarga' ? '🟢' : '🔴'}
                                                <span className="descricao">{item.descricao} - {item.data.split('-').reverse().join('/')}</span>
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
                    )}
                </div>
            )}

            {isMobile && (showDesconto || showHistorico) && (
                <>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "1rem" }}>
                                    <h4>Itens Selecionados:</h4>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', margin: "1rem 0", maxHeight: "200px", overflowY: "auto" }}>
                                    {itens.map((item, index) => (
                                        <button
                                            key={index}
                                            className="btn-cartao"
                                            style={{
                                                background: itensSelecionados.includes(item) ? "#e65c00" : "#ff6f00"
                                            }}
                                            onClick={() => {
                                                const index = itensSelecionados.findIndex(i => i.id === item.id);
                                                if (index !== -1) {
                                                    const novaLista = [...itensSelecionados];
                                                    novaLista[index].quantidade += 1;
                                                    setItensSelecionados(novaLista);
                                                } else {
                                                    setItensSelecionados([...itensSelecionados, { ...item, quantidade: 1 }]);
                                                }

                                            }}
                                        >
                                            {item.nome} - R$ {item.preco.toFixed(2).replace('.', ',')}
                                        </button>
                                    ))}
                                    {itensSelecionados.map((item, index) => (
                                        <div key={index} className="item-selecionado">
                                            <span>{item.nome}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <button onClick={() => {
                                                    const novaLista = [...itensSelecionados];
                                                    novaLista[index].quantidade -= 1;
                                                    if (novaLista[index].quantidade <= 0) {
                                                        novaLista.splice(index, 1);
                                                    }
                                                    setItensSelecionados(novaLista);
                                                }}>-</button>
                                                <span>{item.quantidade}</span>
                                                <button onClick={() => {
                                                    const novaLista = [...itensSelecionados];
                                                    novaLista[index].quantidade += 1;
                                                    setItensSelecionados(novaLista);
                                                }}>+</button>
                                            </div>
                                        </div>
                                    ))}

                                </div>

                                <p><b>Total:</b> R$ {itensSelecionados.reduce((total, item) => total + (item.preco * item.quantidade), 0).toFixed(2).replace('.', ',')}</p>
                                <button
                                    className="confirmar"
                                    onClick={() => {
                                        if (matricula && valorDesconto && itensSelecionados.length > 0) {
                                            setConfirmarDescontoModal(true);
                                        } else {
                                            toast.error("Você deve preencher todos os campos.")
                                        }
                                    }}
                                >
                                    Confirmar Desconto
                                </button>

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
                                                <li className={`transacao ${item.tipo} tooltip`} title={`Id da transação: ${item.id} Usuário: ${item.matricula}`} key={index}>
                                                    <span className="tooltip-text"><b>Id da transação:</b> {item.id}<br /><b>Usuário:</b> {item.matricula}</span>
                                                    {item.tipo === 'Recarga' ? '🟢' : '🔴'}
                                                    <span className="descricao">{item.descricao} - {item.data.split('-').reverse().join('/')}</span>
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
                                <button className="fechar" onClick={() => setShowHistorico(false)}>Fechar</button>
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

            {confirmarDescontoModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: "400px" }}>
                        <h3>Confirmar Desconto</h3>
                        <p>Tem certeza que deseja descontar <b>{valorDesconto}</b> do aluno com matrícula <b>{matricula}</b>?</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                            <button className="confirmar" onClick={async () => {
                                const valorNumero = parseFloat(valorDesconto.replace(/\D/g, '')) / 100;
                                try {
                                    setLoading(true)
                                    const res = await fetch("https://lanchouapp.site/endpoints/creditar.php", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            matricula,
                                            credito: -valorNumero,
                                            descricao: (() => {
                                                const contagem = {};
                                                itensSelecionados.forEach(item => {
                                                    contagem[item.nome] = (contagem[item.nome] || 0) + 1;
                                                });
                                                return Object.entries(contagem)
                                                    .map(([nome, qtd]) => `${qtd}x ${nome}`)
                                                    .join(' + ');
                                            })()


                                        })
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                        toast.success(`${valorDesconto} descontado de ${matricula} com sucesso!`);
                                        setItensSelecionados([])
                                        setMatricula("")
                                        setValorDesconto("")
                                        await carregarHistorico();
                                    } else if (data.error) {
                                        throw new Error(data.error)
                                    } else {
                                        throw new Error("Erro ao aplicar desconto.");
                                    }
                                } catch (error) {
                                    console.error("Erro:", error);
                                    toast.error(error.message);
                                } finally {
                                    setLoading(false)
                                }
                                setConfirmarDescontoModal(false);
                            }}>
                                Confirmar
                            </button>
                            <button className="fechar" onClick={() => {
                                setItensSelecionados([])
                                setMatricula("")
                                setValorDesconto("")
                                setConfirmarDescontoModal(false)
                            }
                            } style={{ marginLeft: "5px" }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {showAdicionarItemModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: "500px" }}>
                        <h2>Adicionar Novo Item</h2>
                        <input type="text" placeholder="Nome do item" id="nomeItem" />
                        <input type="number" placeholder="Preço em reais (ex: 3.50)" id="precoItem" step="0.01" />
                        <button className="confirmar" onClick={async () => {
                            const nome = document.getElementById("nomeItem").value.trim();
                            const preco = parseFloat(document.getElementById("precoItem").value);

                            if (!nome || isNaN(preco) || preco <= 0) {
                                toast.error("Preencha corretamente o nome e o preço do item.");
                                return;
                            }

                            try {
                                const res = await fetch("https://lanchouapp.site/endpoints/inserir_item.php", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ nome, preco })
                                });

                                const data = await res.json();

                                if (data.success) {
                                    toast.success("Item adicionado com sucesso!");
                                    setItens(prev => [...prev, { id: data.id, nome, preco }]);
                                    setShowAdicionarItemModal(false);
                                } else {
                                    throw new Error(data.error || "Erro ao adicionar item.");
                                }
                            } catch (err) {
                                console.error("Erro:", err);
                                toast.error(err.message);
                            }
                        }}>
                            Adicionar
                        </button>

                        <h3 style={{ marginTop: '1rem' }}>Itens Existentes</h3>
                        <ul style={{ maxHeight: "200px", overflowY: "auto", padding: "0", listStyle: "none" }}>
                            {itens.map(item => (
                                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                                    <span>{item.nome} - R$ {item.preco.toFixed(2).replace('.', ',')}</span>
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm(`Deseja realmente excluir o item "${item.nome}"?`)) return;

                                            try {
                                                const res = await fetch("https://lanchouapp.site/endpoints/deletar_item.php", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ id: item.id })
                                                });

                                                const data = await res.json();

                                                if (data.success) {
                                                    toast.success("Item excluído!");
                                                    setItens(prev => prev.filter(i => i.id !== item.id));
                                                } else {
                                                    throw new Error(data.error || "Erro ao excluir item.");
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                toast.error(err.message);
                                            }
                                        }}
                                        className="fechar"
                                    >
                                        Excluir
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <button className="fechar" onClick={() => setShowAdicionarItemModal(false)}>Fechar</button>
                    </div>
                </div>
            )}



            {loading && (
                <Loading />
            )}

        </div>
    );
}

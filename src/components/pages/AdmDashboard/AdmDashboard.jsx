import { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import './AdmDashboard.css';
import Login from '../Login/Login';

export default function AdmDashboard({ nomeAdmin, setPage }) {
    const [showHistorico, setShowHistorico] = useState(false);
    const [showCadastro, setShowCadastro] = useState(false);
    const [showDesconto, setShowDesconto] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [matricula, setMatricula] = useState('');
    const [dataFiltro, setDataFiltro] = useState('');
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const [qrError, setQrError] = useState('');
    const [valorDesconto, setValorDesconto] = useState('');


    const historico = [
        { tipo: 'recharge', descricao: 'Recarga de aluno João', valor: 20.0, data: '2025-06-05' },
        { tipo: 'discount', descricao: 'Compra do aluno Maria', valor: 8.5, data: '2025-06-04' },
    ];

    const historicoFiltrado = dataFiltro
        ? historico.filter((item) => item.data === dataFiltro)
        : historico;

    function aplicarFiltroData(novaData) {
        setDataFiltro(novaData);
        setCarregandoHistorico(true);
        setTimeout(() => setCarregandoHistorico(false), 600);
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <span className="emoji">🍽️</span>
                <h2>Painel da Cantina</h2>
                <p>Olá, <strong>{nomeAdmin}</strong>!</p>
                <button className="btn-sair" onClick={() => setPage(<Login setPage={setPage} />)}>
                    <span className="material-icons">logout</span> Sair
                </button>
            </header>

            <div className="card resumo-card">
                <h3>📊 Resumo</h3>
                <p>Total de alunos: <b>25</b></p>
                <p>Saldo total circulante: <b>R$ 740,00</b></p>
            </div>

            <div className="card menu-opcoes">
                <button onClick={() => setShowCadastro(true)}>Cadastrar Aluno</button>
                <button onClick={() => setShowDesconto(true)}>Descontar Saldo</button>
                <button onClick={() => setShowHistorico(true)}>Ver Histórico Geral</button>
            </div>

            {/* Modal Cadastro de Aluno */}
            {showCadastro && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>👨‍🎓 Cadastrar Aluno</h2>
                        <input type="text" placeholder="Nome do aluno" />
                        <input type="text" placeholder="Matrícula" />
                        <input type="text" placeholder="Senha" />
                        <button className="confirmar">Cadastrar</button>
                        <button className="fechar" onClick={() => setShowCadastro(false)}>Fechar</button>
                    </div>
                </div>
            )}

            {/* Modal Desconto */}
            {showDesconto && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>➖ Descontar Saldo</h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Matrícula do aluno"
                                value={matricula}
                                onChange={(e) => setMatricula(e.target.value)}
                            />
                            <button onClick={() => setShowQrModal(true)}>📷 Ler QR Code</button>
                        </div>
                        <input type="text" placeholder="Valor (R$)" value={valorDesconto} onChange={formatarValor} />
                        <input type="text" placeholder="Descrição da compra" />
                        <button className="confirmar">Confirmar Desconto</button>
                        <button className="fechar" onClick={() => setShowDesconto(false)}>Fechar</button>
                    </div>
                </div>
            )}

            {/* Modal QR Code */}
            {showQrModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>📷 Leitor de QR Code</h2>

                        {qrError ? (
                            <p style={{ color: 'red', padding: '1rem' }}>{qrError}</p>
                        ) : (
                            <div style={{ width: '100%' }}>
                                <QrReader
                                    onResult={(result, error) => {
                                        if (!!result) {
                                            setMatricula(result?.text);
                                            setShowQrModal(false);
                                            setQrError('');
                                        }
                                        if (!!error) {
                                            if (error.name === 'NotAllowedError') {
                                                setQrError('Permissão para acessar a câmera negada.');
                                            } else if (error.name === 'NotFoundError') {
                                                setQrError('Nenhuma câmera foi encontrada neste dispositivo.');
                                            } else if (error.name === 'NotReadableError') {
                                                setQrError('Não foi possível acessar a câmera.');
                                            }
                                        }
                                    }}
                                    constraints={{ facingMode: 'environment' }}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        )}

                        <button className="fechar" onClick={() => {
                            setShowQrModal(false);
                            setQrError('');
                        }}>Fechar</button>
                    </div>
                </div>
            )}


            {/* Modal Histórico Geral */}
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
                                            <span className="descricao">{item.descricao} - {item.data.split('-').reverse().join('/')}</span>
                                            <span className="valor">{item.tipo === 'recharge' ? '+' : '-'} R$ {item.valor.toFixed(2)}</span>
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
        setValorDesconto(valor);
    }

}

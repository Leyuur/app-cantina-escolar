export default function PagamentoFalhou() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#f44336' }}>❌ Pagamento falhou</h1>
      <p>Ocorreu um problema. Tente novamente.</p>
      <a href="/" style={{ color: '#ff6f00' }}>Voltar</a>
    </div>
  );
}

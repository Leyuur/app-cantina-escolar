import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AlunoDashboard from '../AlunoDashboard/AlunoDashboard';

export default function PagamentoSucesso({ setPage }) {
  const [params] = useSearchParams();
  const [redirecionado, setRedirecionado] = useState(false);

  useEffect(() => {
    if (redirecionado) return; // evita execução múltipla

    const status = params.get('status');
    const paymentId = params.get('payment_id');
    const valor = params.get('valor');

    console.log("Pagamento aprovado!");
    console.log("ID do pagamento:", paymentId);
    console.log("Status:", status);
    console.log("Valor:", valor);

    // Redireciona para o dashboard com recarga simulada
    setPage(<AlunoDashboard setPage={setPage} pagamento={valor} />);
    setRedirecionado(true);
  }, [params, redirecionado, setPage]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#4CAF50' }}>✅ Pagamento aprovado!</h1>
      <p>ID do pagamento: <b>{params.get('payment_id')}</b></p>
      <p>Valor recebido: R$ <b>{params.get('valor')}</b></p>
      <p>Você será redirecionado automaticamente...</p>
    </div>
  );
}

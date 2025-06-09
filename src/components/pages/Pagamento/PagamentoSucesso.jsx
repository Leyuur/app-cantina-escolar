import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function PagamentoSucesso() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const valor = params.get("valor");
    
    setTimeout(() => {
      navigate(`/dashboard?recarga=${valor}`);
    }, 2000);
  }, [params, navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#4CAF50' }}>✅ Pagamento aprovado!</h1>
      <p>ID do pagamento: <b>{params.get('payment_id')}</b></p>
      <p>Valor: R$ {params.get('valor')}</p>
      <p>Você será redirecionado em instantes...</p>
    </div>
  );
}

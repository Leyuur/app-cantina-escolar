




import { useState, useEffect } from 'react';
import Login from './components/pages/Login/Login';
import AlunoDashboard from './components/pages/AlunoDashboard/AlunoDashboard';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import PagamentoFalhou from './components/pages/Pagamento/PagamentoFalhou';
import PagamentoPendente from './components/pages/Pagamento/PagamentoPendente';
import PagamentoSucesso from './components/pages/Pagamento/PagamentoSucesso';

function App() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    setPage(<Login setPage={setPage} />);
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={page} />
          <Route path="/dashboard" element={
            <AlunoDashboard
              nome={"Yuri"}
              saldo={8}
              matricula={"12345"}
              setPage={setPage}
            />
          } />
          <Route path="/pagamento-sucesso" element={<PagamentoSucesso setPage={setPage} />} />
          <Route path="/pagamento-falhou" element={<PagamentoFalhou />} />
          <Route path="/pagamento-pendente" element={<PagamentoPendente />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="colored"
      />
    </>
  );
}

export default App;


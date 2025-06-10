import { useState, useEffect } from 'react';
import '../AlunoDashboard/AlunoDashboard.css';

export default function Pix({ img, caminho, statusUrl, idPagamento, onConfirm, onClose }) {
    const [status, setStatus] = useState("pending");
    const [copiado, setCopiado] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(statusUrl);
                const data = await res.json();
                if (data.status === 'approved') {
                    setStatus("approved");
                    clearInterval(interval);
                    if (onConfirm) onConfirm(data.valor);
                }
            } catch (error) {
                console.error('Erro ao verificar status do pagamento:', error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [statusUrl, onConfirm]);

    function copiarCodigo() {
        navigator.clipboard.writeText(caminho).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        });
    }

    function handleClose() {
        if (status === 'pending' && idPagamento) {
            fetch('https://lanchouapp.site/endpoints/cancelar.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: idPagamento })
            }).catch(console.error);
        }
        onClose();
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "300px" }}>
                <h2><span className="material-symbols-outlined">qr_code</span> Pagamento via Pix</h2>
                <img
                    src={`data:image/png;base64,${img}`}
                    alt="QR Code Pix"
                    className="pix-qr"
                    style={{ width: "200px" }}
                />
                <p>Ou copie e cole o código:</p>
                <textarea
                    rows="5"
                    readOnly
                    className="pix-codigo"
                    value={caminho}
                    style={{
                        width: "100%",
                        fontSize: "1rem",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        resize: "none",
                        backgroundColor: "#f8f8f8",
                        fontFamily: "monospace",
                        color: "#333",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
                    }}
                />
                <button className="pix-copiar" onClick={copiarCodigo}>
                    {copiado ? "Copiado!" : "Copiar código Pix"}
                </button>
                <p className="pix-status" style={{ color: status === "approved" ? "green" : "#ff6f00" }}>
                    {status === "approved" ? "Pagamento aprovado!" : "Aguardando pagamento..."}
                </p>
            </div>
        </div>
    );
}

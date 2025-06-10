import "./Loading.css"

export default function Loading() {
    return (
        <div className="modal-overlay" style={{flexDirection: "column"}}>
            <div className="loader"></div>
            <p class="text" style={{color: "white"}}>Carregando</p>
        </div>
    )
}

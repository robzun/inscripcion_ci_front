import Header from "./Header"

export default function ValidadorDashboard(){
    return (
          <>
            <Header />
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <h1>Bienvenido</h1>
            </div>
            <button className="button-card">
                <i class="fa-solid fa-file" style={{fontSize: "600%", color: "#18529D"}}></i>
                <p>Revisar documentos</p>
            </button>
          </>
        );
}
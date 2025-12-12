import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function Inscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch (status) {
      case "alert":
        return <i className="fa-regular fa-circle-xmark" style={{color: "red"}}></i>;
      case "success":
        return <i className="fa-regular fa-circle-check" style={{color: "green"}}></i>;
      case "pending":
        return <i className="fa-regular fa-circle-pause" style={{color: "gold"}}></i>;
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchInscripciones = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.error("No hay token. El usuario no está autenticado.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:8000/enrollment/me",
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (!response.ok) {
          console.error("Error al obtener inscripciones:", response.status);
          setInscripciones([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        setInscripciones(items);
      } catch (error) {
        console.error(error);
        setInscripciones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInscripciones();
  }, []);

  return (
    <>
      <Header />

      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <h1>Tus inscripciones</h1>
        <aside>
          <button
            className="new-insc-button"
            onClick={() => navigate('/nueva-inscripcion', { replace: true })}
          >
            Nueva inscripción
          </button>
        </aside>
      </div>

      {loading && (
        <p className="inscription-null">Cargando inscripciones...</p>
      )}

      {!loading && inscripciones.length === 0 && (
        <p className="inscription-null">Aún no te has inscrito a ningún grupo.</p>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: "20px",
        marginTop: "20px"
      }}>
        {inscripciones.map((insc) => (
          <div
            key={insc.id}
            style={{
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0px 3px 10px rgba(0,0,0,0.15)",
              background: "white"
            }}
          >
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <h2>{insc.language_name || insc.language || "Idioma"}</h2>
              <h2>{insc.level_code || insc.level || ""}</h2>
            </div>

            <p>Campus: {insc.campus_name || insc.campus}</p>
            <p>NRC: {insc.nrc}</p>

            <div style={{marginTop: "10px", fontSize: "24px"}}>
              {getStatusIcon(insc.status)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function Inscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    if (!status) return null;

    const normalized = status.toLowerCase();

    if (normalized.includes("pend")) {
      return <i className="fa-regular fa-circle-pause" style={{ color: "gold" }}></i>;
    }
    if (normalized.includes("rech") || normalized.includes("cancel")) {
      return <i className="fa-regular fa-circle-xmark" style={{ color: "red" }}></i>;
    }

    return <i className="fa-regular fa-circle-check" style={{ color: "green" }}></i>;
  };

  useEffect(() => {
    const fetchInscripciones = async () => {
      try {
        const token = localStorage.getItem("token");
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
        const items = Array.isArray(data.data) ? data.data : [];
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
            key={insc.id_enrollment}
            className='container'
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2>{insc.group_name}</h2>
              <div style={{ fontSize: "30px" }}>
                {getStatusIcon(insc.enrollment_status)}
              </div>
            </div>

            <p>Periodo: {insc.academic_term_name}</p>
            <p>Tipo: {insc.enrollment_type_name}</p>

            {insc.student && (
              <p>Alumno: {insc.student.given_names} {insc.student.paternal_last_name}</p>
            )}
            
            <p style={{ marginTop: "10px", color: "#555" }}>
              Fecha de inscripción: {new Date(insc.enrollment_date).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

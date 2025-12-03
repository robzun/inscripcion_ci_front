import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from "./Header";

function DocsUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const inscripcionData = location.state || {};
  
  const [documentos, setDocumentos] = useState([]);
  const [archivosSubidos, setArchivosSubidos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No hay sesión iniciada');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/document_type/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los tipos de documentos');
        }

        const data = await response.json();
        console.log("DATA RECIBIDA:", data);

        // Ajuste robusto: asegurar que "documentos" sea siempre un array
        if (Array.isArray(data)) {
          setDocumentos(data);
        } else if (Array.isArray(data.results)) {
          setDocumentos(data.results);
        } else if (Array.isArray(data.document_types)) {
          setDocumentos(data.document_types);
        } else {
          console.warn("La API no regresó un array. Valor recibido:", data);
          setDocumentos([]);
        }

      } catch (err) {
        console.error('Error al cargar documentos:', err);
        setError('Error al cargar los tipos de documentos');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentos();
  }, []);

  const handleFileChange = (documentoId, file) => {
    setArchivosSubidos(prev => ({
      ...prev,
      [documentoId]: file
    }));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Datos de inscripción:', inscripcionData);
    console.log('Archivos subidos:', archivosSubidos);

    alert('Documentos enviados');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div>
          <h1>Sube tus documentos</h1>
          <div className="container">
            <p>Cargando...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div>
          <h1>Sube tus documentos</h1>
          <div className="container">
            <p style={{ color: 'red' }}>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div>
        <h1>Sube tus documentos</h1>

          <div className="info-inscripcion">
            <div className="info-item">
              <span className="info-label">Idioma</span>
              <span className="info-value">{inscripcionData.idiomaNombre || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Nivel</span>
              <span className="info-value">{inscripcionData.nivelNombre || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Grupo</span>
              <span className="info-value">{inscripcionData.grupoNombre || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">NRC</span>
              <span className="info-value">{inscripcionData.nrc || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Campus</span>
              <span className="info-value">{inscripcionData.campusNombre || 'N/A'}</span>
            </div>
          </div>
        
        <div className="container">
          
          <form onSubmit={handleSubmit}>
            <div className="documentos-list">
              {documentos.map((documento) => (
                <div key={documento.id} className="documento-item">
                  <div className="documento-info">
                    <h3 className="documento-titulo">{documento.name}</h3>
                    {documento.description && (
                      <p className="documento-descripcion">{documento.description}</p>
                    )}
                  </div>

                  <div className="documento-actions">
                    <label htmlFor={`file-${documento.id}`} className="upload-button">
                      <i className="fa-solid fa-upload"></i>
                    </label>
                    <input
                      type="file"
                      id={`file-${documento.id}`}
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(documento.id, e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <span className={`estado ${archivosSubidos[documento.id] ? 'subido' : 'pendiente'}`}>
                      {archivosSubidos[documento.id] ? archivosSubidos[documento.id].name : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'right'}}>
              <button type="button" className='cancel-button' onClick={handleCancel}>
                Regresar
              </button>
              <button type="submit">
                Enviar
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}

export default DocsUpload;
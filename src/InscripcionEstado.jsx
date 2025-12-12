import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from "./Header";

function InscripcionEstado() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const inscripcionData = location.state || {};
  
  const [tiposInscripcion, setTiposInscripcion] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [archivosSubidos, setArchivosSubidos] = useState({});
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No hay sesión iniciada');
          setLoading(false);
          return;
        }

        // Fetch de datos del usuario
        const userResponse = await fetch('http://localhost:8000/user/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const user = await userResponse.json();
        console.log("DATOS DEL USUARIO:", user);
        setUserData(user);

        // Fetch de tipos de inscripción
        const response = await fetch('http://localhost:8000/enrollment_type', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los tipos de inscripción');
        }

        const data = await response.json();
        console.log("TIPOS DE INSCRIPCIÓN:", data);

        const tipos = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
        setTiposInscripcion(tipos);

        const tipoSeleccionado = tipos.find(
          tipo => tipo.id_enrollment_type == inscripcionData.tipo
        );

        if (tipoSeleccionado && Array.isArray(tipoSeleccionado.documents)) {
          setDocumentos(tipoSeleccionado.documents);
        } else {
          console.warn("No se encontraron documentos para el tipo seleccionado");
          setDocumentos([]);
        }

      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [inscripcionData.tipo]);

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

    const documentosFaltantes = documentos.filter(
      doc => !archivosSubidos[doc.id_document_type]
    );

    if (documentosFaltantes.length > 0) {
      alert('Por favor, sube todos los documentos requeridos antes de enviar.');
      return;
    }

    if (!userData) {
      alert('No se pudieron obtener los datos del usuario');
      return;
    }

    setEnviando(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No hay sesión iniciada');
        setEnviando(false);
        return;
      }

      const paymentMethodMap = {
        'ventanilla': 'Ventanilla (Directo en Banco)',
        'mipago_uv': 'MiPago UV',
        'transferencia': 'Transferencia bancaria'
      };

      // Crear FormData para enviar todo junto
      const formData = new FormData();

      // Preparar el objeto de datos de inscripción
      const enrollmentData = {
        id_enrollment: 0,
        student: {
          given_names: userData.given_names,
          paternal_last_name: userData.paternal_last_name,
          maternal_last_name: userData.maternal_last_name,
          enrollment_number: userData.enrollment_number,
          phone: userData.phone,
          email: userData.email,
          sex: userData.sex,
          role: userData.role,
          active: userData.active
        },
        group_name: inscripcionData.grupoNombre || "string",
        enrollment_status: "Pendiente",
        enrollment_date: new Date().toISOString(),
        academic_term_name: "string",
        enrollment_type_name: inscripcionData.tipoNombre || "string",
        language_name: inscripcionData.idiomaNombre || "string",
        level_name: inscripcionData.nivelNombre || "string",
        nrc: inscripcionData.nrc || "string",
        campus_name: inscripcionData.campusNombre || "string",
        note: "",
        outreach_channel: "Facebook",
        payment_method: paymentMethodMap[inscripcionData.metodoPago] || "Ventanilla (Directo en Banco)",
        payment_line: "",
        reference_number: "",
        authorization_number: ""
      };

      // Agregar los datos de inscripción como un campo JSON string
      formData.append('enrollment', JSON.stringify(enrollmentData));

      // Agregar cada archivo al FormData con su document_type_id
      Object.keys(archivosSubidos).forEach((documentId) => {
        const file = archivosSubidos[documentId];
        if (file) {
          formData.append('files', file);
          formData.append('document_type_ids', documentId);
        }
      });

      console.log('Enviando inscripción con archivos...');

      const enrollmentResponse = await fetch('http://localhost:8000/enrollment/submit_enrollment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NO incluir Content-Type, el navegador lo establece automáticamente
        },
        body: formData
      });

      if (!enrollmentResponse.ok) {
        const errorData = await enrollmentResponse.json();
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.detail || 'Error al crear la inscripción');
      }

      const enrollmentResult = await enrollmentResponse.json();
      console.log('Inscripción creada:', enrollmentResult);

      alert('✅ Inscripción creada exitosamente. Tus documentos han sido registrados.');
      navigate('/dashboard');

    } catch (err) {
      console.error('Error al enviar inscripción:', err);
      alert(`Error al procesar la inscripción: ${err.message}`);
    } finally {
      setEnviando(false);
    }
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
            <div style={{ 
              backgroundColor: '#fee', 
              border: '1px solid #fcc', 
              borderRadius: '8px', 
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ color: '#c33', marginTop: 0, marginBottom: '1rem' }}>
                ⚠️ {error}
              </h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'right' }}>
              <button type="button" className='cancel-button' onClick={handleCancel}>
                Regresar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div>
        <h1>Inscripción</h1>

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
              {documentos.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                  No hay documentos requeridos para este tipo de inscripción
                </p>
              ) : (
                documentos.map((documento) => (
                  <div key={documento.id_document_type} className="documento-item">
                    <div className="documento-info">
                      <h3 className="documento-titulo">{documento.name}</h3>
                      {documento.description && (
                        <p className="documento-descripcion">{documento.description}</p>
                      )}
                    </div>

                    <div className="documento-actions">
                      <label htmlFor={`file-${documento.id_document_type}`} className="upload-button">
                        <i className="fa-solid fa-upload"></i>
                      </label>
                      <input
                        type="file"
                        id={`file-${documento.id_document_type}`}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(documento.id_document_type, e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <span className={`estado ${archivosSubidos[documento.id_document_type] ? 'subido' : 'pendiente'}`}>
                        {archivosSubidos[documento.id_document_type] 
                          ? archivosSubidos[documento.id_document_type].name 
                          : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'right'}}>
              <button 
                type="button" 
                className='cancel-button' 
                onClick={handleCancel}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}

export default InscripcionEstado;
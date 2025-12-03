import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "./Header";

function Formulario() {
  const navigate = useNavigate();

  const apiURL = "http://localhost:8000";
  
  const [formData, setFormData] = useState({
    tipo: '',
    campus: '',
    metodoPago: '',
    idioma: '',
    nivel: '',
    grupo: ''
  });

  const [opciones, setOpciones] = useState({
    tipo: [
      { id: 'nuevo_ingreso', nombre: 'Nuevo ingreso' },
      { id: 'reinscripcion', nombre: 'Reinscripción' }
    ],
    campus: [],
    metodoPago: [
      { id: 'ventanilla', nombre: 'Ventanilla' },
      { id: 'mipago_uv', nombre: 'MiPago UV' },
      { id: 'transferencia', nombre: 'Transferencia bancaria' }
    ],
    idioma: [],
    nivel: [],
    grupo: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState([]);

  const campos = [
    { id: 'tipo', label: 'Tipo', placeholder: 'Selecciona el tipo', key: 'tipo' },
    { id: 'campus', label: 'Campus', placeholder: 'Selecciona el campus', key: 'campus' },
    { id: 'metodoPago', label: 'Método de pago', placeholder: 'Selecciona el método', key: 'metodoPago' },
    { id: 'idioma', label: 'Idioma', placeholder: 'Selecciona el idioma', key: 'idioma' },
    { id: 'nivel', label: 'Nivel', placeholder: 'Selecciona el nivel', key: 'nivel' },
    { id: 'grupo', label: 'Grupo', placeholder: 'Selecciona el grupo', key: 'grupo' },
  ];

  const parseArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.items)) return data.items;
    console.warn("La API no regresó un arreglo:", data);
    return [];
  };

  useEffect(() => {
    const fetchOpciones = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No hay sesión iniciada');
          setErrorDetails(['No se encontró un token de autenticación válido']);
          setLoading(false);
          return;
        }

        const endpoints = [
          { url: apiURL + '/campus', name: 'Campus' },
          { url: apiURL + '/language', name: 'Idiomas' },
          { url: apiURL + '/level', name: 'Niveles' },
          { url: apiURL + '/offered_group', name: 'Grupos' }
        ];

        const headers = { 'Authorization': `Bearer ${token}` };

        const responses = await Promise.all(
          endpoints.map(endpoint => 
            fetch(endpoint.url, { headers })
              .then(res => ({ res, name: endpoint.name }))
          )
        );

        const errors = [];
        const successfulData = [];

        for (let i = 0; i < responses.length; i++) {
          const { res, name } = responses[i];
          if (!res.ok) {
            try {
              const errorData = await res.json();
              const detail = errorData.detail || res.statusText || 'Error desconocido';
              errors.push(`Error al cargar ${name}: ${detail}`);
            } catch (e) {
              errors.push(`Error al cargar ${name}: ${res.status} ${res.statusText}`);
            }
            successfulData.push(null);
          } else {
            try {
              const data = await res.json();
              successfulData.push(data);
            } catch (e) {
              errors.push(`Error al procesar datos de ${name}: ${e.message}`);
              successfulData.push(null);
            }
          }
        }

        if (errors.length > 0) {
          setError('Error al cargar algunos campos del formulario');
          setErrorDetails(errors);
          setLoading(false);
          return;
        }

        console.log("CAMPUS:", successfulData[0]);
        console.log("IDIOMAS:", successfulData[1]);
        console.log("NIVELES:", successfulData[2]);
        console.log("GRUPOS:", successfulData[3]);

        setOpciones(prev => ({
          ...prev,
          campus: parseArray(successfulData[0]),
          idioma: parseArray(successfulData[1]),
          nivel: parseArray(successfulData[2]),
          grupo: parseArray(successfulData[3])
        }));

      } catch (err) {
        console.error('Error al cargar opciones:', err);
        setError('Error al cargar las opciones del formulario');
        setErrorDetails([err.message || 'Error desconocido al conectar con el servidor']);
      } finally {
        setLoading(false);
      }
    };

    fetchOpciones();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const idiomaNombre = opciones.idioma.find(i => i.id == formData.idioma)?.name || '';
    const nivelNombre = opciones.nivel.find(n => n.id == formData.nivel)?.name || '';
    const grupoSeleccionado = opciones.grupo.find(g => g.id == formData.grupo);
    const grupoNombre = grupoSeleccionado?.base_group?.group_name || grupoSeleccionado?.group_name || grupoSeleccionado?.name || '';
    const nrc = grupoSeleccionado?.nrc || '';
    const campusSeleccionado = opciones.campus.find(c => c.id == formData.campus);
    const campusNombre = campusSeleccionado?.campus_name || campusSeleccionado?.name || '';
  
    navigate('/subir-documentos', {
      state: {
        ...formData,
        idiomaNombre,
        nivelNombre,
        grupoNombre,
        nrc,
        campusNombre
      }
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div>
          <h1>Inscripción</h1>
          <div className="container">
            <p>Cargando opciones...</p>
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
          <h1>Inscripción</h1>
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
              {errorDetails.length > 0 && (
                <div style={{ marginLeft: '1rem' }}>
                  <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Detalles:</p>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    {errorDetails.map((detail, index) => (
                      <li key={index} style={{ color: '#666', marginBottom: '0.5rem' }}>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'right' }}>
              <button type="button" className='cancel-button' onClick={handleCancel}>
                Cancelar
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
        <form onSubmit={handleSubmit}>
          <div className="container">

            <div className="fields-grid">
              {campos.map((campo) => (
                <div key={campo.id} className="campo-item">
                  <label htmlFor={campo.id} className="campo-label">{campo.label}</label>

                  <select 
                    id={campo.id} 
                    name={campo.id} 
                    className="campo-select"
                    value={formData[campo.id]}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled hidden>{campo.placeholder}</option>

                    {Array.isArray(opciones[campo.key]) && opciones[campo.key].map((opcion) => {
                      let displayText = '';
                      
                      // Para campus: usar campus_name
                      if (campo.key === 'campus') {
                        displayText = opcion.campus_name || opcion.name || opcion.nombre || `Campus ${opcion.id}`;
                      }
                      // Para grupo: usar base_group.group_name
                      else if (campo.key === 'grupo') {
                        displayText = opcion.base_group?.group_name || opcion.group_name || opcion.name || opcion.nombre || `Grupo ${opcion.id}`;
                      }
                      // Para los demás campos
                      else {
                        displayText = opcion.name || opcion.nombre || opcion.description || `Opción ${opcion.id}`;
                      }
                      
                      return (
                        <option key={opcion.id} value={opcion.id}>
                          {displayText}
                        </option>
                      );
                    })}

                  </select>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'right'}}>
              <button type="button" className='cancel-button' onClick={handleCancel}>Cancelar</button>
              <button type="submit">Continuar</button>
            </div>

          </div>
        </form>
      </div>
    </>
  );
}

export default Formulario;
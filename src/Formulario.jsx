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
    tipo: [],
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

  const [todosLosNiveles, setTodosLosNiveles] = useState([]);
  const [todosLosGrupos, setTodosLosGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState([]);
  const [mostrarAdvertenciaNivel, setMostrarAdvertenciaNivel] = useState(false);
  const [mostrarAdvertenciaGrupo, setMostrarAdvertenciaGrupo] = useState(false);

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
          { url: apiURL + '/enrollment_type', name: 'Tipos de inscripción' },
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

        console.log("TIPOS:", successfulData[0]);
        console.log("CAMPUS:", successfulData[1]);
        console.log("IDIOMAS:", successfulData[2]);
        console.log("NIVELES:", successfulData[3]);
        console.log("GRUPOS:", successfulData[4]);

        const nivelesCompletos = parseArray(successfulData[3]);
        const gruposCompletos = parseArray(successfulData[4]);
        
        setTodosLosNiveles(nivelesCompletos);
        setTodosLosGrupos(gruposCompletos);

        setOpciones(prev => ({
          ...prev,
          tipo: parseArray(successfulData[0]),
          campus: parseArray(successfulData[1]),
          idioma: parseArray(successfulData[2]),
          nivel: [],
          grupo: []
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

  // Filtrar niveles cuando cambia el idioma
  useEffect(() => {
    if (formData.idioma) {
      const nivelesFiltrados = todosLosNiveles.filter(
        nivel => nivel.id_language == formData.idioma
      );
      setOpciones(prev => ({
        ...prev,
        nivel: nivelesFiltrados
      }));
      
      const nivelActualValido = nivelesFiltrados.some(n => n.id_level == formData.nivel);
      if (formData.nivel && !nivelActualValido) {
        setFormData(prev => ({ ...prev, nivel: '', grupo: '' }));
      }
    } else {
      setOpciones(prev => ({
        ...prev,
        nivel: [],
        grupo: []
      }));
      setFormData(prev => ({ ...prev, nivel: '', grupo: '' }));
    }
  }, [formData.idioma, todosLosNiveles]);

  // Filtrar grupos cuando cambia el nivel
  useEffect(() => {
    if (formData.nivel) {
      const gruposFiltrados = todosLosGrupos.filter(
        grupo => grupo.base_group?.level?.id_level == formData.nivel
      );
      setOpciones(prev => ({
        ...prev,
        grupo: gruposFiltrados
      }));
      
      const grupoActualValido = gruposFiltrados.some(g => g.id_offered_group == formData.grupo);
      if (formData.grupo && !grupoActualValido) {
        setFormData(prev => ({ ...prev, grupo: '' }));
      }
    } else {
      setOpciones(prev => ({
        ...prev,
        grupo: []
      }));
      setFormData(prev => ({ ...prev, grupo: '' }));
    }
  }, [formData.nivel, todosLosGrupos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNivelClick = (e) => {
    if (!formData.idioma) {
      e.preventDefault();
      setMostrarAdvertenciaNivel(true);
      setTimeout(() => setMostrarAdvertenciaNivel(false), 3000);
    }
  };

  const handleGrupoClick = (e) => {
    if (!formData.nivel) {
      e.preventDefault();
      setMostrarAdvertenciaGrupo(true);
      setTimeout(() => setMostrarAdvertenciaGrupo(false), 3000);
    }
  };

  const handleCancel = () => {
    navigate('/mis-inscripciones');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const tipoSeleccionado = opciones.tipo.find(t => t.id_enrollment_type == formData.tipo);
    const tipoNombre = tipoSeleccionado?.name || tipoSeleccionado?.nombre || '';
    const idiomaNombre = opciones.idioma.find(i => i.id_language == formData.idioma)?.name || '';
    const nivelNombre = todosLosNiveles.find(n => n.id_level == formData.nivel)?.name || '';
    const grupoSeleccionado = todosLosGrupos.find(g => g.id_offered_group == formData.grupo);
    const grupoNombre = grupoSeleccionado?.base_group?.group_name || grupoSeleccionado?.group_name || grupoSeleccionado?.name || '';
    const nrc = grupoSeleccionado?.nrc || '';
    const campusSeleccionado = opciones.campus.find(c => c.id_campus == formData.campus);
    const campusNombre = campusSeleccionado?.campus_name || campusSeleccionado?.name || '';
  
    navigate('/subir-documentos', {
      state: {
        ...formData,
        tipoNombre,
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

            {mostrarAdvertenciaNivel && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#856404'
              }}>
                ⚠️ Por favor, selecciona un idioma primero
              </div>
            )}

            {mostrarAdvertenciaGrupo && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#856404'
              }}>
                ⚠️ Por favor, selecciona un nivel primero
              </div>
            )}

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
                    onClick={campo.id === 'nivel' ? handleNivelClick : campo.id === 'grupo' ? handleGrupoClick : undefined}
                    required
                    disabled={
                      (campo.id === 'nivel' && !formData.idioma) ||
                      (campo.id === 'grupo' && !formData.nivel)
                    }
                  >
                    <option value="" disabled hidden>{campo.placeholder}</option>

                    {Array.isArray(opciones[campo.key]) && opciones[campo.key].map((opcion) => {
                      let displayText = '';
                      let optionKey = '';
                      
                      if (campo.key === 'tipo') {
                        displayText = opcion.name || opcion.nombre || `Tipo ${opcion.id_enrollment_type}`;
                        optionKey = opcion.id_enrollment_type;
                      }
                      else if (campo.key === 'campus') {
                        displayText = opcion.campus_name || opcion.name || opcion.nombre || `Campus ${opcion.id_campus}`;
                        optionKey = opcion.id_campus;
                      }
                      else if (campo.key === 'grupo') {
                        displayText = opcion.base_group?.group_name || opcion.group_name || opcion.name || opcion.nombre || `Grupo ${opcion.id_offered_group}`;
                        optionKey = opcion.id_offered_group;
                      }
                      else if (campo.key === 'idioma') {
                        displayText = opcion.name || opcion.nombre || `Idioma ${opcion.id_language}`;
                        optionKey = opcion.id_language;
                      }
                      else if (campo.key === 'nivel') {
                        displayText = opcion.name || opcion.nombre || `Nivel ${opcion.id_level}`;
                        optionKey = opcion.id_level;
                      }
                      else {
                        displayText = opcion.name || opcion.nombre || opcion.description || `Opción ${opcion.id}`;
                        optionKey = opcion.id;
                      }
                      
                      return (
                        <option key={optionKey} value={optionKey}>
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
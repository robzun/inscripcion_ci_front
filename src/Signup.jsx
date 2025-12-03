import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    enrollmentNumber: '',
    givenNames: '',
    paternalLastName: '',
    maternalLastName: '',
    sex: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBack = () => {
    navigate(-1); // Regresa a la página anterior
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación de longitud de contraseña
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validación de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/user/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          given_names: formData.givenNames,
          paternal_last_name: formData.paternalLastName,
          maternal_last_name: formData.maternalLastName,
          password: formData.password,
          active: true,
          sex: formData.sex,
          enrollment_number: formData.enrollmentNumber,
          phone: formData.phone
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        console.error(errData);
        throw new Error(errData?.detail || 'Error al crear la cuenta');
      }


      const data = await response.json();
      console.log('Cuenta creada exitosamente:', data);
      
      navigate('/login');
      
    } catch (err) {
      setError(err.message || 'Ocurrió un error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1>Crear cuenta de estudiante</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        
        <div className="form-row">
          <label>
            Matrícula
            <input 
              type="text" 
              name="enrollmentNumber"
              value={formData.enrollmentNumber}
              onChange={handleChange}
              placeholder="Ingresa tu matrícula"
              required
            />
          </label>
          <label>
            Nombre(s)
            <input 
              type="text"
              name="givenNames"
              value={formData.givenNames}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              required
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Apellido paterno
            <input 
              type="text"
              name="paternalLastName"
              value={formData.paternalLastName}
              onChange={handleChange}
              placeholder="Ingresa tu apellido paterno"
              required
            />
          </label>
          <label>
            Apellido materno
            <input 
              type="text"
              name="maternalLastName"
              value={formData.maternalLastName}
              onChange={handleChange}
              placeholder="Ingresa tu apellido materno"
              required
            />
          </label>
          <label>
            Género
            <select 
              name="sex" 
              value={formData.sex}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecciona tu género</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Teléfono
            <input 
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ingresa tu número de teléfono"
              required
            />
          </label>
          <label>
            Correo electrónico
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingresa tu correo electrónico"
              required
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Contraseña (mínimo 8 caracteres)
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              minLength={8}
              required
            />
          </label>
          <label>
            Confirmar contraseña
            <input 
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirma tu contraseña"
              minLength={8}
              required
            />
          </label>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'right'}}>
          <button type="button" className='cancel-button' onClick={handleBack}>
            Cancelar
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  );
}
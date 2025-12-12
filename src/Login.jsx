import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
  
  const fetchUserRole = async (token) => {
    const userResponse = await fetch('http://localhost:8000/user/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Error al obtener la información del usuario');
    }

    const userData = await userResponse.json();
    return userData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginResponse = await fetch('http://localhost:8000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Credenciales incorrectas');
      }

      const loginData = await loginResponse.json();
      console.log('Inicio de sesión exitoso:', loginData);

      const token = loginData.access_token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        throw new Error('Token no recibido');
      }

      const userData = await fetchUserRole(token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      const userRole = userData.role;

      if (userRole === 'Alumno') {
        navigate('/mis-inscripciones');
      } else if (userRole === 'Administrador') {
        navigate('/dashboard');
      } else if (userRole === 'Validador') {
        navigate('/lista-inscripciones');
      } else {        
        console.warn(`Rol desconocido: ${userRole}. Redirigiendo a /`);
        navigate('/'); 
      }
      
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src="assets/fondo_usbi.png" alt="USBI" className="login-image" />
      <aside className="login-form">
        <h1>Centro de idiomas</h1>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            required
          />
          <input 
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
        <div className="links">
          {/* <a href="#">¿Quieres cambiar o recuperar tu contraseña?</a> */}
          <a href="/registro">¿No tienes cuenta?</a>
        </div>
      </aside>
    </div>
  );
}
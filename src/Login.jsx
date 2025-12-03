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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      if (!response.ok) {
        throw new Error('Credenciales incorrectas');
      }

      const data = await response.json();
      console.log('Inicio de sesión exitoso:', data);
      
      // Guardar el token en localStorage
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      // Opcional: guardar información del usuario si la API la devuelve
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // Redirigir al dashboard o página principal
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
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
          <a href="#">¿Quieres cambiar o recuperar tu contraseña?</a>
          <a href="/registro">¿No tienes cuenta?</a>
        </div>
      </aside>
    </div>
  );
}
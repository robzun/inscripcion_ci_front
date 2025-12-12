import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  // ... (otros estados y handleChange son iguales)

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
  
  // Función para obtener la información del usuario (incluyendo el rol)
  const fetchUserRole = async (token) => {
    const userResponse = await fetch('http://localhost:8000/user/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Asegúrate de enviar el token de autorización
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      // Manejar el caso de que la llamada falle, aunque el login haya sido exitoso
      throw new Error('Error al obtener la información del usuario');
    }

    const userData = await userResponse.json();
    return userData; // Devuelve el objeto completo del usuario
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Llamada al endpoint de Login
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

      // Guardar el token en localStorage
      const token = loginData.access_token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        throw new Error('Token no recibido');
      }

      // 2. Obtener la información completa del usuario, incluyendo el rol
      const userData = await fetchUserRole(token);
      localStorage.setItem('user', JSON.stringify(userData)); // Opcional: guardar info completa
      
      const userRole = userData.role;

      // 3. Lógica de Redirección Condicional
      // Aquí defines a dónde redirigir según el valor de 'role'
      if (userRole === 'Alumno') {
        navigate('/mis_inscripciones'); // Ruta para Alumnos
      } else if (userRole === 'Administrador') {
        navigate('/dashboard'); // Ruta para Administradores
      } else if (userRole === 'Validador') {
        navigate('/'); // Ruta para Validadores
      } else {
        // Redirección por defecto o mensaje de error de rol desconocido
        console.warn(`Rol desconocido: ${userRole}. Redirigiendo a /`);
        navigate('/'); 
      }
      
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      // Importante: Si falla alguna de las llamadas, limpia el token si se llegó a guardar
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... (El JSX del formulario es el mismo)
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
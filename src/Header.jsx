import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header(){
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Obtener el nombre del usuario al cargar el componente
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Obtener el token del localStorage
                const token = localStorage.getItem('token');
                
                if (!token) {
                    // Si no hay token, redirigir al login
                    // navigate('/login');
                    return;
                }
                
                const response = await fetch('http://localhost:8000/user/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    // Si el token no es válido o expiró, limpiar localStorage y redirigir
                    // localStorage.removeItem('token');
                    // localStorage.removeItem('user');
                    throw new Error('Token inválido o expirado');
                }

                const data = await response.json();
                
                // Ajusta según la estructura de respuesta de tu API
                // Ejemplo: si devuelve { given_names: "Roberto", paternal_last_name: "Zúñiga" }
                const fullName = `${data.given_names} ${data.paternal_last_name} ${data.maternal_last_name}`;
                setUsername(fullName);
                
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                // Si hay error, redirigir al login
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        // Limpiar el localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirigir al login
        navigate('/login');
    };

    const handleProfile = () => {
        // Redirigir al perfil
        navigate('/perfil');
        setIsMenuOpen(false);
    };

    // Cerrar el menú al hacer click fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return(
        <header>
            <a href="/dashboard" className="home-button">
                <h2>Centro de Idiomas UV</h2>
            </a>
            <div className="user-menu-container" ref={menuRef}>
                <button className="user-display" onClick={toggleMenu} disabled={loading}>
                    {loading ? 'Cargando...' : username}
                    <i className={`fa-solid fa-caret-${isMenuOpen ? 'up' : 'down'}`}></i>
                </button>
                {isMenuOpen && (
                    <div className="user-dropdown-menu">
                        <button onClick={handleProfile} className="menu-item">
                            Mi perfil
                        </button>
                        <button onClick={handleLogout} className="menu-item">
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}
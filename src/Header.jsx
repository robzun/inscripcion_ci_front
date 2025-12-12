import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header(){
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    navigate('/login');
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
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    throw new Error('Token inválido o expirado');
                }

                const data = await response.json();
                
                const fullName = `${data.given_names} ${data.paternal_last_name} ${data.maternal_last_name}`;
                setUsername(fullName);
                
            } catch (error) {
                console.error('Error al cargar usuario:', error);
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('/perfil');
        setIsMenuOpen(false);
    };

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
            {/* <a href="/dashboard" className="home-button">
            </a> */}
                <h2>Centro de Idiomas UV</h2>
            <div className="user-menu-container" ref={menuRef}>
                <button className="user-display" onClick={toggleMenu} disabled={loading}>
                    {loading ? 'Cargando...' : username}
                    <i className={`fa-solid fa-caret-${isMenuOpen ? 'up' : 'down'}`}></i>
                </button>
                {isMenuOpen && (
                    <div className="user-dropdown-menu">
                        {/* <button onClick={handleProfile} className="menu-item">
                            Mi perfil
                        </button> */}
                        <button onClick={handleLogout} className="menu-item">
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}
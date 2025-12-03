import { Navigate } from 'react-router-dom';

export default function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  
  console.log('PublicRoute - Token:', token); // Para debug
  
  // Si hay token, redirigir al dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si no hay token, mostrar la página pública
  return children;
}
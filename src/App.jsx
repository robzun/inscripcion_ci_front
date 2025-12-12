import { Routes, Route } from 'react-router-dom';
import Inscripciones from './Inscripciones';
import Formulario from './Formulario';
import Login from './Login';
import Signup from './Signup';
import DocsUpload from './DocsUpload';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import ValidadorDashboard from './ValidadorDashboard';
import ListaInscripciones from './ListaInscripciones';
import InscripcionEstado from './InscripcionEstado';

function App() {
  return (
    <Routes>
      {/* Rutas públicas (solo accesibles sin sesión) */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/registro" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } 
      />

      {/* Rutas protegidas (requieren sesión iniciada) */}
      <Route 
        path="/mis-inscripciones" 
        element={
          <ProtectedRoute>
            <Inscripciones />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ver-inscripcion" 
        element={
          <ProtectedRoute>
            <InscripcionEstado />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/nueva-inscripcion" 
        element={
          <ProtectedRoute>
            <Formulario />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/subir-documentos"
        element={
          <ProtectedRoute>
            <DocsUpload />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ValidadorDashboard/>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/lista-inscripciones"
        element={
          <ProtectedRoute>
            <ListaInscripciones/>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
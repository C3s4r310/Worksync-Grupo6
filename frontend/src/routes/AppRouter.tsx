import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import ProyectosPage from '../pages/ProyectosPage';
import TareasPage from '../pages/TareasPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/home" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/proyectos" element={
          <ProtectedRoute><ProyectosPage /></ProtectedRoute>
        } />
        <Route path="/proyectos/:proyectoId/tareas" element={
          <ProtectedRoute><TareasPage /></ProtectedRoute>
        } />

        {/* Rutas pendientes — redirigen a home por ahora */}
        <Route path="/tareas"   element={<Navigate to="/proyectos" replace />} />
        <Route path="/miembros" element={<Navigate to="/home" replace />} />
        <Route path="/reportes" element={<Navigate to="/home" replace />} />
        <Route path="/ajustes"  element={<Navigate to="/home" replace />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
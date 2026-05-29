import { useState } from 'react';
import './tareas.css';
import TareasPage from './pages/TareasPage';
import ProyectosPage from './pages/ProyectosPage';
import Login from './pages/Login'; 

function App() {
  const [vistaActual, setVistaActual] = useState<'tareas' | 'proyectos'>('tareas');
  
  // Monitoreamos el token directamente del almacenamiento del navegador
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('token'));

  // Función interna para cerrar sesión de manera limpia
  const manejarLogout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
  };

  // Si el usuario no está autenticado, renderizamos la pantalla de Login integrada
  if (!token) {
    return <Login />;
  }

  return (
    // RNF-03
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1115', fontFamily: 'Arial, sans-serif', color: '#e2e8f0' }}>
      
      {/* Barra de Navegación Superior (Sofisticada y Unificada) */}
      <nav style={{
        backgroundColor: '#161920',
        color: 'white',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        borderBottom: '1px solid #232834', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginRight: '48px', letterSpacing: '1px', color: '#f8fafc' }}>
            WorkSync
          </div>
          
          <div style={{ display: 'flex', gap: '28px', height: '100%' }}>
            <button 
              onClick={() => setVistaActual('tareas')}
              style={{
                background: 'transparent',
                color: vistaActual === 'tareas' ? '#38bdf8' : '#94a3b8', // Azul cielo suave para el activo, gris neutro para inactivo
                border: 'none',
                fontSize: '15px',
                fontWeight: vistaActual === 'tareas' ? '600' : '400',
                cursor: 'pointer',
                borderBottom: vistaActual === 'tareas' ? '3px solid #38bdf8' : '3px solid transparent',
                padding: '0 4px',
                height: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              Tablero de Tareas
            </button>
            
            <button 
              onClick={() => setVistaActual('proyectos')}
              style={{
                background: 'transparent',
                color: vistaActual === 'proyectos' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                fontSize: '15px',
                fontWeight: vistaActual === 'proyectos' ? '600' : '400',
                cursor: 'pointer',
                borderBottom: vistaActual === 'proyectos' ? '3px solid #38bdf8' : '3px solid transparent',
                padding: '0 4px',
                height: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              Directorio de Proyectos
            </button>
          </div>
        </div>

        {/* Botón de Cerrar Sesión: Añade funcionalidad real al flujo sin romper nada */}
        <button
          onClick={manejarLogout}
          style={{
            backgroundColor: 'transparent',
            color: '#ef4444', // Tono rojo pastel suave para evitar estridencias
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Cerrar sesión
        </button>
      </nav>

      {/* Área de Contenido Principal */}
      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {vistaActual === 'tareas' ? <TareasPage /> : <ProyectosPage />}
      </main>

    </div>
  );
}

export default App;
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './layout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: '/home',      icon: '⊞', label: 'Inicio' },
  { path: '/proyectos', icon: '◫', label: 'Proyectos' },
  { path: '/tareas',    icon: '✓', label: 'Tareas' },
  { path: '/miembros',  icon: '◎', label: 'Miembros' },
  { path: '/reportes',  icon: '↗', label: 'Reportes' },
  { path: '/ajustes',   icon: '⚙', label: 'Ajustes' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="ws-layout">
      {/* ── SIDEBAR ── */}
      <aside className="ws-sidebar">
        <div className="ws-logo">
          <div className="ws-logo-icon">W</div>
          <span className="ws-logo-text">WorkSync</span>
        </div>

        <nav className="ws-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              className={`ws-nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="ws-nav-icon">{item.icon}</span>
              <span className="ws-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="ws-main">
        {/* Header */}
        <header className="ws-header">
          <div className="ws-breadcrumb">
            {NAV_ITEMS.find(i => location.pathname.startsWith(i.path))?.label ?? 'WorkSync'}
          </div>

          <div className="ws-header-right">
            <button className="ws-notif-btn" title="Notificaciones">🔔</button>

            <div className="ws-user-menu" onClick={() => setMenuAbierto(p => !p)}>
              <div className="ws-avatar">
                {(user?.username?.[0] ?? 'U').toUpperCase()}
              </div>
              <div className="ws-user-info">
                <span className="ws-user-name">{user?.username ?? 'Usuario'}</span>
                <span className="ws-user-role">Colaborador</span>
              </div>
              <span className="ws-chevron">▾</span>

              {menuAbierto && (
                <div className="ws-dropdown">
                  <button onClick={logout} className="ws-dropdown-item ws-logout">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="ws-content">
          {children}
        </main>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import useAuth from '../hooks/useAuth';
import { listarNotificaciones, marcarComoLeida, dispararAlertasManualmente } from '@/services/notificacionService';
import type { Notificacion } from '@/types/notificacion';

// ── CUSTOM INLINE SVG ICONS ──
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const ProjectsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const TasksIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const MembersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ReportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="settings-gear-icon">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const AuditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: '/home',      icon: <HomeIcon />, label: 'Inicio' },
  { path: '/proyectos', icon: <ProjectsIcon />, label: 'Proyectos' },
  { path: '/tareas',    icon: <TasksIcon />, label: 'Tareas' },
  { path: '/miembros',  icon: <MembersIcon />, label: 'Miembros' },
  { path: '/reportes',  icon: <ReportsIcon />, label: 'Reportes' },
  { path: '/ajustes',   icon: <SettingsIcon />, label: 'Ajustes' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sidebarMovilAbierto, setSidebarMovilAbierto] = useState(false);
  
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [notifMenuAbierto, setNotifMenuAbierto] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  useEffect(() => {
    // 1. Theme initialization
    const savedTheme = localStorage.getItem('ws_theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }

    // 2. Avatar loading
    if (user?.id) {
      const savedAvatar = localStorage.getItem(`ws_user_avatar_${user.id}`);
      if (savedAvatar) {
        setAvatarBase64(savedAvatar);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      cargarNotificaciones();
    }
  }, [user]);

  const cargarNotificaciones = async () => {
    try {
      const data = await listarNotificaciones();
      setNotificaciones(data || []);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    }
  };

  const handleLeerNotificacion = async (id: number) => {
    try {
      await marcarComoLeida(id);
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      router.push('/tareas');
      setNotifMenuAbierto(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispararAlertas = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await dispararAlertasManualmente();
      alert(res);
      await cargarNotificaciones();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [...NAV_ITEMS];
  if (user?.rol === 'ADMIN' || user?.rol === 'LIDER') {
    navItems.splice(5, 0, { path: '/auditoria', icon: <AuditIcon />, label: 'Auditoría' });
  }

  return (
    <div className="ws-layout">
      {/* Overlay backdrop visible en móviles cuando el menú está abierto */}
      {sidebarMovilAbierto && (
        <div 
          className="ws-sidebar-overlay"
          onClick={() => setSidebarMovilAbierto(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`ws-sidebar ${sidebarMovilAbierto ? 'open' : ''}`}>
        <div className="ws-logo">
          <div className="ws-logo-icon">W</div>
          <span className="ws-logo-text">WorkSync</span>
        </div>

        <nav className="ws-nav">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`ws-nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                onClick={() => setSidebarMovilAbierto(false)}
              >
                <span className="ws-nav-icon">{item.icon}</span>
                <span className="ws-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="ws-main">
        {/* Header */}
        <header className="ws-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              className="ws-menu-toggle"
              onClick={() => setSidebarMovilAbierto(p => !p)}
              title="Menú"
            >
              ☰
            </button>
            <div className="ws-breadcrumb">
              {navItems.find(i => pathname.startsWith(i.path))?.label ?? 'WorkSync'}
            </div>
          </div>

          <div className="ws-header-right">
            <div style={{ position: 'relative' }}>
              <button 
                className="ws-notif-btn" 
                title="Notificaciones"
                onClick={() => setNotifMenuAbierto(p => !p)}
                style={{ position: 'relative' }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifMenuAbierto && (
                <div className="ws-dropdown" style={{ 
                  right: 0, 
                  width: 320, 
                  padding: '12px 0',
                  maxHeight: 380,
                  overflowY: 'auto',
                  zIndex: 100,
                  display: 'block'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '0 16px 8px',
                    borderBottom: '1px solid var(--border)',
                    marginBottom: 8
                  }}>
                    <span style={{ fontWeight: 'bold', fontSize: 13, color: 'var(--text-primary)' }}>
                      Notificaciones ({unreadCount})
                    </span>
                    <button 
                      onClick={handleDispararAlertas}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-color)',
                        fontSize: 10.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      ⚡ Escanear plazos
                    </button>
                  </div>

                  {notificaciones.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                      No tienes notificaciones
                    </div>
                  ) : (
                    notificaciones.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => handleLeerNotificacion(n.id)}
                        style={{
                          padding: '10px 16px',
                          fontSize: 12,
                          lineHeight: 1.45,
                          cursor: 'pointer',
                          borderBottom: '1px solid #f8fafc',
                          backgroundColor: n.leida ? 'transparent' : 'rgba(37, 99, 235, 0.05)',
                          transition: 'background-color 0.2s',
                          color: n.leida ? 'var(--text-muted)' : 'var(--text-primary)',
                          fontWeight: n.leida ? 'normal' : '500'
                        }}
                      >
                        <div>{n.mensaje}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 4 }}>
                          {new Date(n.fecha).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="ws-user-menu" onClick={() => setMenuAbierto(p => !p)}>
              <div className="ws-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatarBase64 ? (
                  <img src={avatarBase64} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (user?.username?.[0] ?? 'U').toUpperCase()
                )}
              </div>
              <div className="ws-user-info">
                <span className="ws-user-name">{user?.username ?? 'Usuario'}</span>
                <span className="ws-user-role">
                  {user?.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1).toLowerCase() : 'Colaborador'}
                </span>
              </div>
              <span className="ws-chevron">▾</span>

              {menuAbierto && (
                <div className="ws-dropdown">
                  <Link href="/cuenta" className="ws-dropdown-item" style={{ textDecoration: 'none' }}>
                    👤 Mi cuenta
                  </Link>
                  <button onClick={handleLogout} className="ws-dropdown-item ws-logout">
                    🚪 Cerrar sesión
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

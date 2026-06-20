"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import useAuth from '../hooks/useAuth';
import { listarNotificaciones, marcarComoLeida, dispararAlertasManualmente } from '@/services/notificacionService';
import type { Notificacion } from '@/types/notificacion';

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
  const router = useRouter();
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [sidebarMovilAbierto, setSidebarMovilAbierto] = useState(false);
  
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [notifMenuAbierto, setNotifMenuAbierto] = useState(false);

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
          {NAV_ITEMS.map(item => {
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
              {NAV_ITEMS.find(i => pathname.startsWith(i.path))?.label ?? 'WorkSync'}
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
              <div className="ws-avatar">
                {(user?.username?.[0] ?? 'U').toUpperCase()}
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

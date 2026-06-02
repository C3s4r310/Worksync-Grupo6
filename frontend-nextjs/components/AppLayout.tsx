"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import useAuth from '../hooks/useAuth';

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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="ws-layout">
      {/* ── SIDEBAR ── */}
      <aside className="ws-sidebar">
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
          <div className="ws-breadcrumb">
            {NAV_ITEMS.find(i => pathname.startsWith(i.path))?.label ?? 'WorkSync'}
          </div>

          <div className="ws-header-right">
            <button className="ws-notif-btn" title="Notificaciones">🔔</button>

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

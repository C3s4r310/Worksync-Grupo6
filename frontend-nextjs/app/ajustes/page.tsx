"use client";

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '@/hooks/useAuth';

export default function AjustesPage() {
  const { user } = useAuth();
  
  // Configuración de interfaz
  const [glassBlur, setGlassBlur] = useState(true);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifSound, setNotifSound] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [taskLimit, setTaskLimit] = useState(3);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  
  const [guardado, setGuardado] = useState(false);

  // Cargar preferencias iniciales desde localStorage
  useEffect(() => {
    const savedBlur = localStorage.getItem('ws_glass_blur') !== 'false';
    const savedSubtasks = localStorage.getItem('ws_show_subtasks') !== 'false';
    const savedTheme = (localStorage.getItem('ws_theme') || 'dark') as 'dark' | 'light';
    const savedSound = localStorage.getItem('ws_notif_sound') !== 'false';
    const savedEmail = localStorage.getItem('ws_notif_email') !== 'false';
    const savedLimit = Number(localStorage.getItem('ws_task_limit') || '3');

    setGlassBlur(savedBlur);
    setShowSubtasks(savedSubtasks);
    setTheme(savedTheme);
    setNotifSound(savedSound);
    setNotifEmail(savedEmail);
    setTaskLimit(savedLimit);

    if (user?.id) {
      const savedAvatar = localStorage.getItem(`ws_user_avatar_${user.id}`);
      if (savedAvatar) {
        setAvatarBase64(savedAvatar);
      }
    }
  }, [user]);

  const handleSave = () => {
    localStorage.setItem('ws_glass_blur', String(glassBlur));
    localStorage.setItem('ws_show_subtasks', String(showSubtasks));
    localStorage.setItem('ws_theme', theme);
    localStorage.setItem('ws_notif_sound', String(notifSound));
    localStorage.setItem('ws_notif_email', String(notifEmail));
    localStorage.setItem('ws_task_limit', String(taskLimit));

    // Aplicar Blur dinámicamente
    if (!glassBlur) {
      document.documentElement.style.setProperty('--glass-blur', 'none');
    } else {
      document.documentElement.style.setProperty('--glass-blur', 'blur(16px) saturate(180%)');
    }

    // Aplicar Tema dinámicamente
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }

    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarBase64(base64String);
        if (user?.id) {
          localStorage.setItem(`ws_user_avatar_${user.id}`, base64String);
          // Recargar para aplicar en todo el sitio
          window.location.reload();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    if (user?.id) {
      localStorage.removeItem(`ws_user_avatar_${user.id}`);
      setAvatarBase64(null);
      window.location.reload();
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px',
            letterSpacing: '-0.5px'
          }}>
            Ajustes del Sistema
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Personaliza el rendimiento visual, alertas de notificaciones y flujo operativo de tu espacio de trabajo.
          </p>
        </div>

        {guardado && (
          <div style={{
            backgroundColor: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            color: '#34d399',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✨</span> ¡Ajustes guardados y aplicados correctamente!
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '800px' }}>
          
          {/* SECCIÓN: FOTO DE PERFIL */}
          <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Imagen de Perfil</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Avatar Preview */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '2px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 700,
                backgroundColor: 'rgba(255,255,255,0.03)',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {avatarBase64 ? (
                  <img src={avatarBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (user?.username?.[0] ?? 'U').toUpperCase()
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Sube una foto de perfil</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Esta foto se mostrará en el menú de navegación y en el apartado de mensajería de los colaboradores.</span>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <label 
                    className="btn-primary" 
                    style={{ 
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '12.5px', padding: '6px 14px', cursor: 'pointer', maxWidth: 'fit-content', margin: 0 
                    }}
                  >
                    Examinar archivo...
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {avatarBase64 && (
                    <button 
                      onClick={handleRemoveAvatar}
                      className="btn-secondary"
                      style={{ fontSize: '12.5px', padding: '6px 14px', border: '1px solid var(--border)' }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN: RENDIMIENTO Y ASPECTO */}
          <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Rendimiento & Interfaz</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Blur toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Efecto de Desfoque de Cristal (Backdrop Blur)</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Desactívalo para mejorar el rendimiento de la tarjeta gráfica en computadoras lentas o dispositivos móviles.</span>
                </div>
                <label className="ws-switch" style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
                  <input 
                    type="checkbox" 
                    checked={glassBlur}
                    onChange={(e) => setGlassBlur(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="ws-slider" style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: glassBlur ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                    transition: '.3s', borderRadius: '34px', border: '1px solid var(--border)'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '16px', width: '16px', left: glassBlur ? '24px' : '4px', bottom: '3px',
                      backgroundColor: '#fff', transition: '.3s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}/>
                  </span>
                </label>
              </div>

              {/* Show Subtasks toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Mostrar Subtareas en el Tablero</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Visualiza las subtareas como fichas jerárquicas directas en las columnas de Kanban.</span>
                </div>
                <label className="ws-switch" style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
                  <input 
                    type="checkbox" 
                    checked={showSubtasks}
                    onChange={(e) => setShowSubtasks(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="ws-slider" style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: showSubtasks ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                    transition: '.3s', borderRadius: '34px', border: '1px solid var(--border)'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '16px', width: '16px', left: showSubtasks ? '24px' : '4px', bottom: '3px',
                      backgroundColor: '#fff', transition: '.3s', borderRadius: '50%'
                    }}/>
                  </span>
                </label>
              </div>

              {/* Theme Selector */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Tema Visual del Sistema</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Elige entre la paleta corporativa clara o la estética Glassmorphism neón oscura.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    onClick={() => setTheme('light')}
                    className="ws-btn-secondary"
                    style={{
                      fontSize: '12.5px',
                      padding: '6px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: theme === 'light' ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                      color: theme === 'light' ? '#ffffff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ☀️ Claro
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTheme('dark')}
                    className="ws-btn-secondary"
                    style={{
                      fontSize: '12.5px',
                      padding: '6px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: theme === 'dark' ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                      color: theme === 'dark' ? '#ffffff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    🌙 Oscuro
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN: NOTIFICACIONES */}
          <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Notificaciones & Alertas</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Notif sound */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Sonido de Alerta de Notificación</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reproduce un tono audible al recibir nuevas notificaciones críticas en tiempo real.</span>
                </div>
                <label className="ws-switch" style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
                  <input 
                    type="checkbox" 
                    checked={notifSound}
                    onChange={(e) => setNotifSound(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="ws-slider" style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: notifSound ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                    transition: '.3s', borderRadius: '34px', border: '1px solid var(--border)'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '16px', width: '16px', left: notifSound ? '24px' : '4px', bottom: '3px',
                      backgroundColor: '#fff', transition: '.3s', borderRadius: '50%'
                    }}/>
                  </span>
                </label>
              </div>

              {/* Notif Email */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Resumen por Correo Electrónico</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Envía reportes diarios automáticos de tus tareas vencidas y cambios de estado.</span>
                </div>
                <label className="ws-switch" style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
                  <input 
                    type="checkbox" 
                    checked={notifEmail}
                    onChange={(e) => setNotifEmail(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span className="ws-slider" style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: notifEmail ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                    transition: '.3s', borderRadius: '34px', border: '1px solid var(--border)'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '16px', width: '16px', left: notifEmail ? '24px' : '4px', bottom: '3px',
                      backgroundColor: '#fff', transition: '.3s', borderRadius: '50%'
                    }}/>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* SECCIÓN: FLUJO DE TRABAJO (SOLO LIDER/ADMIN) */}
          <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Gestión de Carga de Trabajo (Asignación Inteligente)</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Límite Máximo de Tareas Activas por Colaborador
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
                  Define el número máximo de tareas simultáneas en estado PENDIENTE, EN PROGRESO y EN REVISION que puede tener un usuario antes de ser marcado como sobrecargado.
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="number"
                    min={1}
                    max={10}
                    value={taskLimit}
                    onChange={(e) => setTaskLimit(Number(e.target.value))}
                    className="form-input"
                    style={{ maxWidth: '100px', margin: 0 }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>tareas simultáneas máximas.</span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÓN DE GUARDADO */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={handleSave}
              className="btn-primary"
              style={{ maxWidth: '200px' }}
            >
              Guardar Cambios
            </button>
          </div>

        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

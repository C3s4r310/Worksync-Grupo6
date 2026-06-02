"use client";

import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { cambiarContrasena as apiCambiarContrasena } from '@/services/authService';

export default function CuentaPage() {
  const { user } = useAuth();
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleCambiarContrasena = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    if (nuevaContrasena.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setGuardando(true);

    apiCambiarContrasena(contrasenaActual, nuevaContrasena)
      .then(() => {
        setSuccess('Contraseña actualizada correctamente.');
        setContrasenaActual('');
        setNuevaContrasena('');
        setConfirmarContrasena('');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña.');
      })
      .finally(() => {
        setGuardando(false);
      });
  };

  const getRoleLabel = (rol?: string) => {
    if (!rol) return 'Colaborador';
    switch (rol.toUpperCase()) {
      case 'ADMIN': return 'Administrador (ADMIN)';
      case 'LIDER': return 'Líder de Proyecto';
      case 'COLABORADOR': return 'Colaborador';
      default: return rol;
    }
  };

  const getRoleDescription = (rol?: string) => {
    if (!rol) return '';
    switch (rol.toUpperCase()) {
      case 'ADMIN':
        return 'Tienes acceso total a la plataforma, incluyendo la capacidad de crear proyectos, editar configuraciones de seguridad globales y cambiar roles de usuario.';
      case 'LIDER':
        return 'Tienes permisos de gestión de proyectos. Puedes crear proyectos, agregar/quitar miembros y administrar todas sus tareas.';
      case 'COLABORADOR':
        return 'Tienes permisos para visualizar proyectos a los que estás asignado y reportar avances en tus tareas asignadas.';
      default:
        return 'Permisos estándar.';
    }
  };

  const getAvatarColor = (rol?: string) => {
    if (!rol) return 'linear-gradient(135deg, #a78bfa, #8b5cf6)';
    switch (rol.toUpperCase()) {
      case 'ADMIN': return 'linear-gradient(135deg, #f43f5e, #be123c)';
      case 'LIDER': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      default: return 'linear-gradient(135deg, #10b981, #047857)';
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="ws-page-header">
          <div>
            <h1 className="ws-page-title">Mi Cuenta</h1>
            <p className="ws-page-subtitle">Administra tus detalles personales y configuraciones de seguridad</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Tarjeta de Información de Usuario */}
          <div className="auth-card" style={{ width: '100%', margin: 0, padding: '24px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
              {/* Avatar Dinámico */}
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: getAvatarColor(user?.rol),
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 700,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                marginBottom: '16px'
              }}>
                {(user?.username?.[0] ?? 'U').toUpperCase()}
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-h)', margin: '0 0 4px 0' }}>
                {user?.username ?? 'Usuario'}
              </h2>
              <span className="ws-badge ws-badge-activo" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '9999px', display: 'inline-block' }}>
                {getRoleLabel(user?.rol)}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Correo Electrónico
                </span>
                <span style={{ fontSize: '15px', color: 'var(--text-h)', fontWeight: 500 }}>
                  {user?.email ?? 'correo@worksync.com'}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Descripción de Permisos
                </span>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {getRoleDescription(user?.rol)}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Estado de Cuenta
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#10b981', fontWeight: 500 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                  Activo
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Seguridad (Cambio de Contraseña) */}
          <div className="auth-card" style={{ width: '100%', margin: 0, padding: '24px', boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '4px' }}>
              Seguridad de la Cuenta
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
            </p>

            {success && (
              <div style={{
                color: '#059669',
                backgroundColor: '#ecfdf5',
                border: '1px solid #d1fae5',
                padding: '10px 14px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '13.5px'
              }}>
                ✓ {success}
              </div>
            )}

            {error && (
              <div style={{
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                padding: '10px 14px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '13.5px'
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleCambiarContrasena} className="form-layout" style={{ gap: '14px' }}>
              <label className="form-label">
                Contraseña Actual
                <input
                  type="password"
                  value={contrasenaActual}
                  onChange={e => setContrasenaActual(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                />
              </label>

              <label className="form-label">
                Nueva Contraseña
                <input
                  type="password"
                  value={nuevaContrasena}
                  onChange={e => setNuevaContrasena(e.target.value)}
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                />
              </label>

              <label className="form-label">
                Confirmar Nueva Contraseña
                <input
                  type="password"
                  value={confirmarContrasena}
                  onChange={e => setConfirmarContrasena(e.target.value)}
                  className="form-input"
                  placeholder="Repite la contraseña"
                />
              </label>

              <button
                type="submit"
                disabled={guardando}
                className="btn-primary"
                style={{ marginTop: '8px' }}
              >
                {guardando ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
              </button>
            </form>
          </div>

        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

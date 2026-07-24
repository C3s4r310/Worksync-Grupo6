"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { listarMiembros, agregarMiembro, retirarMiembro, MiembroDTO } from '@/services/miembroService';
import { obtenerUsuarios, UsuarioDTO } from '@/services/usuarioService';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '@/hooks/useAuth';

// RF-09 Miembros del Proyecto: Gestión de miembros (listar, agregar, retirar).
// RF-08 Roles y Permisos: Validación de permisos para administrar miembros.
export default function ProyectoMiembrosPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const proyectoId = Number(params?.proyectoId ?? 1);
  const esAutorizado = user?.rol === 'ADMIN' || user?.rol === 'LIDER';

  const [miembros, setMiembros] = useState<MiembroDTO[]>([]);
  const [usuariosSistema, setUsuariosSistema] = useState<UsuarioDTO[]>([]);
  
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Formulario para agregar miembro
  const [nuevoUsuarioId, setNuevoUsuarioId] = useState<number | ''>('');
  const [nuevoRol, setNuevoRol] = useState<'COLABORADOR' | 'LIDER'>('COLABORADOR');
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    if (proyectoId) {
      cargarDatos();
    }
  }, [proyectoId]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');
      // Cargar miembros del proyecto
      const listaMiembros = await listarMiembros(proyectoId);
      setMiembros(listaMiembros || []);

      // Cargar usuarios del sistema (solo si es administrador o lider)
      if (esAutorizado) {
        const todosUsuarios = await obtenerUsuarios();
        setUsuariosSistema(todosUsuarios || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar los miembros del proyecto.');
    } finally {
      setCargando(false);
    }
  };

  // Filtrar los usuarios que aún no están asignados en el proyecto
  const usuariosDisponibles = usuariosSistema.filter(u => 
    !miembros.some(m => m.usuarioId === u.id && m.activo)
  );

  const handleAgregarMiembro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoUsuarioId) {
      setError('Por favor selecciona un usuario.');
      return;
    }

    setAgregando(true);
    setError('');
    setExito('');

    try {
      const agregado = await agregarMiembro(proyectoId, Number(nuevoUsuarioId), nuevoRol);
      setMiembros(prev => [...prev, agregado]);
      setNuevoUsuarioId('');
      setNuevoRol('COLABORADOR');
      setExito('¡Miembro agregado con éxito!');
      
      // Limpiar mensaje de éxito
      setTimeout(() => setExito(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al agregar miembro.');
    } finally {
      setAgregando(false);
    }
  };

  const handleRetirarMiembro = async (usuarioId: number) => {
    if (!confirm('¿Estás seguro de que deseas retirar a este miembro del proyecto? Su registro se desactivará pero no se borrará permanentemente.')) return;
    
    setError('');
    setExito('');
    try {
      await retirarMiembro(proyectoId, usuarioId);
      setMiembros(prev => prev.filter(m => m.usuarioId !== usuarioId));
      setExito('Miembro retirado con éxito.');
      setTimeout(() => setExito(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al retirar el miembro.');
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <button 
              className="ws-btn-secondary" 
              onClick={() => router.push('/proyectos')}
              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              ◀ Regresar a proyectos
            </button>
            <h1 className="ws-page-title" style={{ marginTop: '16px' }}>Miembros del Proyecto #{proyectoId}</h1>
            <p className="ws-page-subtitle">Gestiona la participación y roles del equipo dentro de este proyecto.</p>
          </div>

          {error && (
            <div style={{
              color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fee2e2',
              padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {exito && (
            <div style={{
              color: '#10b981', backgroundColor: '#ecfdf5', border: '1px solid #d1fae5',
              padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 600
            }}>
              ✓ {exito}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: esAutorizado ? '1.8fr 1fr' : '1fr', gap: '24px' }}>
            
            {/* Lista de Miembros */}
            <div style={{
              backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
              border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>
                Equipo del Proyecto
              </h2>

              {cargando ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Cargando equipo...</div>
              ) : miembros.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  No hay miembros activos registrados en este proyecto.
                </div>
              ) : (
                <div className="ws-table-wrap">
                  <table className="ws-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Fecha Ingreso</th>
                        {esAutorizado && <th>Acción</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {miembros.map(m => (
                        <tr key={m.id}>
                          <td>
                            <div>
                              <div style={{ fontWeight: 600 }}>{m.nombreUsuario || 'Usuario Desconocido'}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{m.correoUsuario}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`ws-badge ${m.rol === 'LIDER' ? 'ws-badge-activo' : 'ws-badge-progreso'}`} style={{ fontSize: '11px' }}>
                              {m.rol === 'LIDER' ? 'Líder' : 'Colaborador'}
                            </span>
                          </td>
                          <td style={{ color: '#475569', fontSize: '12.5px' }}>
                            {m.fechaIngreso ? new Date(m.fechaIngreso).toLocaleDateString() : '—'}
                          </td>
                          {esAutorizado && (
                            <td>
                              <button 
                                className="ws-btn-icon danger" 
                                title="Retirar Miembro"
                                onClick={() => handleRetirarMiembro(m.usuarioId)}
                                style={{ padding: '6px', fontSize: '13px' }}
                              >
                                ✕ Retirar
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Agregar Miembro (Sólo ADMIN y LIDER) */}
            {esAutorizado && (
              <div style={{
                backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
                border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                height: 'fit-content'
              }}>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                  Agregar Integrante
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                  Invita a un usuario registrado a participar en este proyecto.
                </p>

                <form onSubmit={handleAgregarMiembro} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="ws-field" style={{ margin: 0 }}>
                    <label>Seleccionar Usuario</label>
                    <select
                      value={nuevoUsuarioId}
                      onChange={e => setNuevoUsuarioId(e.target.value ? Number(e.target.value) : '')}
                      required
                    >
                      <option value="">-- Elige un usuario --</option>
                      {usuariosDisponibles.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.nombre} ({u.correo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ws-field" style={{ margin: 0 }}>
                    <label>Rol en el Proyecto</label>
                    <select
                      value={nuevoRol}
                      onChange={e => setNuevoRol(e.target.value as 'COLABORADOR' | 'LIDER')}
                      required
                    >
                      <option value="COLABORADOR">Colaborador</option>
                      <option value="LIDER">Líder de Proyecto</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="ws-btn-primary" 
                    disabled={agregando || !nuevoUsuarioId}
                    style={{ width: '100%', padding: '10px', fontSize: '13.5px', marginTop: '6px', cursor: 'pointer' }}
                  >
                    {agregando ? 'Agregando...' : 'Asignar al Proyecto'}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

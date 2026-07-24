"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearProyecto } from '@/services/proyectoService';
import { obtenerUsuarios, UsuarioDTO } from '@/services/usuarioService';
import { agregarMiembro } from '@/services/miembroService';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '@/hooks/useAuth';

interface MiembroSeleccionado {
  usuarioId: number;
  nombre: string;
  correo: string;
  rol: 'COLABORADOR' | 'LIDER';
}

export default function CrearProyectoPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Guardamos si es administrador o lider general
  const esAutorizado = user?.rol === 'ADMIN' || user?.rol === 'LIDER';

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [prioridad, setPrioridad] = useState('MEDIA');
  const [estado, setEstado] = useState('ACTIVO');
  const [responsable, setResponsable] = useState('');

  const [usuariosSistema, setUsuariosSistema] = useState<UsuarioDTO[]>([]);
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<MiembroSeleccionado[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // Cargar todos los usuarios del sistema al iniciar
  useEffect(() => {
    async function cargarUsuarios() {
      try {
        const data = await obtenerUsuarios();
        setUsuariosSistema(data || []);
      } catch (err) {
        console.error('Error al obtener usuarios:', err);
        setError('No se pudieron cargar los usuarios del sistema para asignación.');
      } finally {
        setCargandoUsuarios(false);
      }
    }
    
    if (esAutorizado) {
      cargarUsuarios();
    }
  }, [esAutorizado]);

  const toggleMiembro = (u: UsuarioDTO) => {
    setMiembrosSeleccionados(prev => {
      const existe = prev.find(m => m.usuarioId === u.id);
      if (existe) {
        return prev.filter(m => m.usuarioId !== u.id);
      } else {
        return [...prev, {
          usuarioId: u.id,
          nombre: u.nombre,
          correo: u.correo,
          rol: 'COLABORADOR'
        }];
      }
    });
  };

  const cambiarRolMiembro = (usuarioId: number, nuevoRol: 'COLABORADOR' | 'LIDER') => {
    setMiembrosSeleccionados(prev =>
      prev.map(m => m.usuarioId === usuarioId ? { ...m, rol: nuevoRol } : m)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del proyecto es obligatorio.');
      return;
    }

    setGuardando(true);
    setError('');
    setExito(false);

    try {
      // 1. Crear el proyecto básico
      const proyectoCreado = await crearProyecto({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        prioridad,
        estado,
        responsable: responsable || undefined
      });

      // 2. Asociar los miembros participantes
      if (miembrosSeleccionados.length > 0) {
        for (const miembro of miembrosSeleccionados) {
          try {
            await agregarMiembro(proyectoCreado.id, miembro.usuarioId, miembro.rol);
          } catch (mErr) {
            console.error(`Error al asociar miembro ${miembro.nombre}:`, mErr);
            // Continuamos agregando los demás miembros aunque uno falle
          }
        }
      }

      setExito(true);
      setTimeout(() => {
        router.push('/proyectos');
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado al crear el proyecto.');
    } finally {
      setGuardando(false);
    }
  };

  if (!esAutorizado) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div style={{ padding: 24, textAlign: 'center', color: '#ef4444' }}>
            <h2>Acceso Denegado</h2>
            <p>Solo los usuarios con rol de Administrador o Líder pueden crear proyectos.</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <button 
              className="ws-btn-secondary" 
              onClick={() => router.push('/proyectos')}
              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              ◀ Regresar a proyectos
            </button>
            <h1 className="ws-page-title" style={{ marginTop: '16px' }}>Crear Nuevo Proyecto</h1>
            <p className="ws-page-subtitle">Registra toda la información esencial e integra a tu equipo inicial.</p>
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
              ✓ ¡Proyecto creado con éxito! Redirigiendo...
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Tarjeta de Información General */}
            <div style={{
              backgroundColor: 'var(--bg-white)', borderRadius: '12px', padding: '24px',
              border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                Datos Generales del Proyecto
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="ws-field" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 500, fontSize: '13.5px', color: 'var(--text-primary)' }}>Nombre del Proyecto *</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej. Reestructuración de Base de Datos"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="ws-field" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 500, fontSize: '13.5px', color: 'var(--text-primary)' }}>Descripción</label>
                  <textarea
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Detalles y objetivos clave del proyecto..."
                    style={{ width: '100%', minHeight: '80px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="ws-field" style={{ margin: 0 }}>
                    <label style={{ fontWeight: 500, fontSize: '13.5px', color: 'var(--text-primary)' }}>Fecha de Inicio</label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={e => setFechaInicio(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div className="ws-field" style={{ margin: 0 }}>
                    <label style={{ fontWeight: 500, fontSize: '13.5px', color: 'var(--text-primary)' }}>Fecha de Término</label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={e => setFechaFin(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="ws-field" style={{ margin: 0 }}>
                    <label style={{ fontWeight: 500, fontSize: '13.5px', color: 'var(--text-primary)' }}>Responsable del Proyecto</label>
                    <select
                      value={responsable}
                      onChange={e => setResponsable(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      <option value="">Selecciona al propietario responsable</option>
                      {usuariosSistema.map(u => (
                        <option key={u.id} value={u.nombre}>
                          {u.nombre} ({u.correo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ws-field" style={{ margin: 0 }}>
                    <label style={{ fontWeight: 500, fontSize: '13.5px', color: 'var(--text-primary)' }}>Prioridad</label>
                    <select
                      value={prioridad}
                      onChange={e => setPrioridad(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      <option value="BAJA">Baja</option>
                      <option value="MEDIA">Media</option>
                      <option value="ALTA">Alta</option>
                    </select>
                  </div>
                </div>

                <div className="ws-field" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 500, fontSize: '13.5px', color: 'var(--text-primary)' }}>Estado Inicial</label>
                  <select
                    value={estado}
                    onChange={e => setEstado(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="EN_PAUSA">En Pausa</option>
                    <option value="FINALIZADO">Finalizado (Cerrado)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tarjeta de Miembros Participantes */}
            <div style={{
              backgroundColor: 'var(--bg-white)', borderRadius: '12px', padding: '24px',
              border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', paddingBottom: '8px' }}>
                Miembros Participantes (RF-02)
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Selecciona los miembros que participarán en el proyecto y asígnales su rol dentro del mismo.
              </p>

              {cargandoUsuarios ? (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Cargando usuarios del sistema...
                </div>
              ) : usuariosSistema.length === 0 ? (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  No se encontraron usuarios registrados en el sistema.
                </div>
              ) : (
                <div style={{
                  maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  {usuariosSistema.map(u => {
                    const miembro = miembrosSeleccionados.find(m => m.usuarioId === u.id);
                    const isSelected = !!miembro;

                    return (
                      <div 
                        key={u.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: '6px', 
                          backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
                          transition: 'background-color 0.2s',
                          borderBottom: '1px solid var(--border)'
                        }}
                      >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleMiembro(u)}
                            style={{ width: '16px', height: '16px' }}
                          />
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 550, color: 'var(--text-primary)' }}>{u.nombre}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{u.correo} | Rol Sistema: {u.rol}</div>
                          </div>
                        </label>

                        {isSelected && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Rol Proyecto:</span>
                            <select
                              value={miembro.rol}
                              onChange={e => cambiarRolMiembro(u.id, e.target.value as 'COLABORADOR' | 'LIDER')}
                              style={{ padding: '3px 8px', fontSize: '12px', height: 'auto', minWidth: '120px' }}
                            >
                              <option value="COLABORADOR">Colaborador</option>
                              <option value="LIDER">Líder de Proyecto</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button 
                type="button" 
                className="ws-btn-secondary" 
                onClick={() => router.push('/proyectos')}
                style={{ padding: '10px 20px', fontSize: '14.5px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="ws-btn-primary" 
                disabled={guardando}
                style={{ padding: '10px 24px', fontSize: '14.5px', cursor: 'pointer' }}
              >
                {guardando ? 'Creando proyecto...' : 'Crear Proyecto'}
              </button>
            </div>

          </form>

        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

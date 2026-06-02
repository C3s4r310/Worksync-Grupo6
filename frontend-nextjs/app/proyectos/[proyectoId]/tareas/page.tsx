"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Tarea, TareaRequest } from '@/types/tarea';
import { PRIORIDAD_CONFIG } from '@/types/tarea';
import { 
  listarTareasPorProyecto, 
  crearTarea, 
  actualizarTarea, 
  eliminarTarea,
  obtenerHistorialTarea 
} from '@/services/tareaService';
import { listarMiembros, MiembroDTO } from '@/services/miembroService';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import TareaForm from '@/components/tareas/TareaForm';

const ESTADOS: Record<string, string> = {
  PENDIENTE:   'ws-badge ws-badge-pendiente',
  EN_PROGRESO: 'ws-badge ws-badge-progreso',
  EN_REVISION: 'ws-badge ws-badge-revision',
  COMPLETADA:  'ws-badge ws-badge-completada',
};

const LABEL_ESTADO: Record<string, string> = {
  PENDIENTE:   'Pendiente',
  EN_PROGRESO: 'En progreso',
  EN_REVISION: 'En revisión',
  COMPLETADA:  'Completado',
};

const PRIORIDAD_ICONO: Record<string, string> = {
  BAJA: '↓', MEDIA: '→', ALTA: '↑', CRITICA: '↑↑',
};

export default function TareasPage() {
  const params = useParams();
  const proyectoId = params?.proyectoId;
  const idProyecto = Number(proyectoId ?? 1);

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [miembros, setMiembros] = useState<MiembroDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tareaEditar, setTareaEditar] = useState<Tarea | null>(null);

  // Consulta de Detalles de Tarea (RF-03 & RF-05)
  const [tareaDetalle, setTareaDetalle] = useState<Tarea | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  useEffect(() => {
    if (idProyecto) {
      cargar();
      cargarMiembros();
    }
  }, [idProyecto]);

  // Cargar historial de auditoría de la tarea al seleccionarla
  useEffect(() => {
    async function cargarHistorial() {
      if (!tareaDetalle) {
        setHistorial([]);
        return;
      }
      try {
        setCargandoHistorial(true);
        const data = await obtenerHistorialTarea(tareaDetalle.id);
        setHistorial(data || []);
      } catch (err) {
        console.error('Error al cargar historial de auditoría:', err);
      } finally {
        setCargandoHistorial(false);
      }
    }
    cargarHistorial();
  }, [tareaDetalle]);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await listarTareasPorProyecto(idProyecto);
      setTareas(data || []);
    } catch {
      setError('No se pudieron cargar las tareas.');
    } finally {
      setCargando(false);
    }
  };

  const cargarMiembros = async () => {
    try {
      const data = await listarMiembros(idProyecto);
      setMiembros(data || []);
    } catch (err) {
      console.error('Error al cargar miembros del proyecto:', err);
    }
  };

  const tareasFiltradas = tareas.filter(t => {
    const coincide = t.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const porEstado = !filtroEstado || t.estado === filtroEstado;
    const porPrioridad = !filtroPrioridad || t.prioridad === filtroPrioridad;
    return coincide && porEstado && porPrioridad;
  });

  const abrirCrear = () => { setTareaEditar(null); setModalAbierto(true); };
  const abrirEditar = (t: Tarea, e: React.MouseEvent) => {
    e.stopPropagation();
    setTareaEditar(t);
    setModalAbierto(true);
  };
  const cerrar = () => { setModalAbierto(false); setTareaEditar(null); };

  const guardar = async (datos: TareaRequest): Promise<void> => {
    if (tareaEditar) {
      const actualizada = await actualizarTarea(tareaEditar.id, datos);
      setTareas(prev => prev.map(t => t.id === tareaEditar.id ? actualizada : t));
    } else {
      const nueva = await crearTarea(datos);
      setTareas(prev => [...prev, nueva]);
    }
    cerrar();
  };

  const eliminar = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await eliminarTarea(id);
      setTareas(prev => prev.filter(t => t.id !== id));
      if (tareaDetalle?.id === id) {
        setTareaDetalle(null);
      }
    } catch {
      setError('Error al eliminar la tarea.');
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="ws-page-header">
          <div>
            <h1 className="ws-page-title">Tareas del Proyecto #{idProyecto}</h1>
            <p className="ws-page-subtitle">Gestiona las tareas del equipo y consulta sus dependencias e historial.</p>
          </div>
          <button className="ws-btn-primary" onClick={abrirCrear}>+ Nueva Tarea</button>
        </div>

        {/* Filtros */}
        <div className="ws-filters">
          <div className="ws-search-wrap">
            <span className="ws-search-icon">🔍</span>
            <input
              className="ws-search-input"
              placeholder="Buscar tareas..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <select className="ws-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.keys(LABEL_ESTADO).map(e => <option key={e} value={e}>{LABEL_ESTADO[e]}</option>)}
          </select>
          <select className="ws-select" value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}>
            <option value="">Todas las prioridades</option>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica</option>
          </select>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: 12, fontSize: 14 }}>{error}</div>}

        {/* Tabla */}
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha límite</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={6} className="ws-empty">Cargando tareas...</td></tr>
              ) : tareasFiltradas.length === 0 ? (
                <tr><td colSpan={6} className="ws-empty">No se encontraron tareas.</td></tr>
              ) : (
                tareasFiltradas.map(t => {
                  const pri = PRIORIDAD_CONFIG[t.prioridad];
                  const priClass = `ws-prioridad ws-prioridad-${t.prioridad.toLowerCase()}`;
                  
                  // Mapear responsableId al nombre real
                  const miembro = miembros.find(m => m.usuarioId === t.responsableId);
                  const nombreResponsable = miembro ? miembro.nombreUsuario : (t.responsableId ? `ID: ${t.responsableId}` : 'Sin asignar');

                  return (
                    <tr 
                      key={t.id} 
                      onClick={() => setTareaDetalle(t)}
                      style={{ cursor: 'pointer' }}
                      title="Haz clic para ver el detalle e historial de la tarea"
                    >
                      <td style={{ fontWeight: 550 }}>{t.titulo}</td>
                      <td style={{ color: '#475569', fontSize: '13.5px' }}>{nombreResponsable}</td>
                      <td>
                        <span className={ESTADOS[t.estado] ?? 'ws-badge'}>
                          {LABEL_ESTADO[t.estado] ?? t.estado}
                        </span>
                      </td>
                      <td>
                        <span className={priClass}>
                          {PRIORIDAD_ICONO[t.prioridad]} {pri?.label || t.prioridad}
                        </span>
                      </td>
                      <td style={{ color: '#64748b' }}>{t.fechaLimite ?? '—'}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="ws-btn-icon" title="Ver Detalle" onClick={() => setTareaDetalle(t)}>👁</button>
                          <button className="ws-btn-icon" title="Editar" onClick={e => abrirEditar(t, e)}>✏️</button>
                          <button className="ws-btn-icon danger" title="Eliminar" onClick={e => eliminar(t.id, e)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="ws-pagination">
            Mostrando {tareasFiltradas.length} de {tareas.length} tareas
          </div>
        </div>

        {/* Modal Tarea Form (Crear/Editar) */}
        {modalAbierto && (
          <TareaForm
            proyectoId={idProyecto}
            tareaEditar={tareaEditar}
            onGuardar={guardar}
            onCancelar={cerrar}
          />
        )}

        {/* Modal de Consulta de Detalles de Tarea (RF-03 & RF-05) */}
        {tareaDetalle && (
          <div className="ws-modal-overlay" onClick={() => setTareaDetalle(null)}>
            <div 
              className="ws-modal" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '640px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}
            >
              <div className="ws-modal-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <h2 className="ws-modal-title" style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                  Detalles de la Tarea #{tareaDetalle.id}
                </h2>
                <button className="ws-modal-close" onClick={() => setTareaDetalle(null)}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                
                {/* Título & Descripción */}
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#1e293b', margin: '0 0 6px 0' }}>
                    {tareaDetalle.titulo}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#475569', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {tareaDetalle.descripcion || 'Sin descripción detallada.'}
                  </p>
                </div>

                {/* Grid de Metadatos */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>Estado</span>
                    <span className={ESTADOS[tareaDetalle.estado] ?? 'ws-badge'} style={{ marginTop: '4px', display: 'inline-block' }}>
                      {LABEL_ESTADO[tareaDetalle.estado] ?? tareaDetalle.estado}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>Prioridad</span>
                    <span 
                      className={`ws-prioridad ws-prioridad-${tareaDetalle.prioridad.toLowerCase()}`}
                      style={{ marginTop: '4px', display: 'inline-block' }}
                    >
                      {PRIORIDAD_ICONO[tareaDetalle.prioridad]} {PRIORIDAD_CONFIG[tareaDetalle.prioridad]?.label || tareaDetalle.prioridad}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>Responsable Asignado</span>
                    <span style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: 600, marginTop: '2px', display: 'block' }}>
                      {(() => {
                        const m = miembros.find(x => x.usuarioId === tareaDetalle.responsableId);
                        return m ? `${m.nombreUsuario} (${m.correoUsuario})` : (tareaDetalle.responsableId ? `ID Colaborador: ${tareaDetalle.responsableId}` : 'Sin responsable');
                      })()}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>Fecha Límite</span>
                    <span style={{ fontSize: '13.5px', color: '#1e293b', marginTop: '2px', display: 'block' }}>
                      {tareaDetalle.fechaLimite || 'Sin fecha límite establecida'}
                    </span>
                  </div>
                </div>

                {/* Dependencias de la Tarea (RF-03) */}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', margin: '0 0 6px 0' }}>
                    Dependencias
                  </h4>
                  {tareaDetalle.dependencias && tareaDetalle.dependencias.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {tareaDetalle.dependencias.map(depId => {
                        const depTask = tareas.find(x => x.id === depId);
                        return (
                          <span 
                            key={depId} 
                            style={{
                              fontSize: '12.5px', backgroundColor: '#e2e8f0', color: '#334155',
                              padding: '4px 10px', borderRadius: '6px', fontWeight: 500
                            }}
                          >
                            🔗 {depTask ? depTask.titulo : `Tarea #${depId}`}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>Esta tarea no depende de ninguna otra.</span>
                  )}
                </div>

                {/* Evidencias (RF-03) */}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', margin: '0 0 6px 0' }}>
                    Evidencias Registradas
                  </h4>
                  {tareaDetalle.evidencias && tareaDetalle.evidencias.length > 0 ? (
                    <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {tareaDetalle.evidencias.map((url, idx) => (
                        <li key={idx} style={{ fontSize: '13.5px' }}>
                          <a 
                            href={url.startsWith('http') ? url : `https://${url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#2563eb', textDecoration: 'underline', wordBreak: 'break-all' }}
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>No se han subido evidencias para esta tarea.</span>
                  )}
                </div>

                {/* Historial de Auditoría / Cambios de Estado (RF-05) */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⏳</span> Historial de Estados (Auditoría)
                  </h4>
                  
                  {cargandoHistorial ? (
                    <div style={{ fontSize: '13px', color: '#64748b', padding: '8px' }}>Cargando bitácora...</div>
                  ) : historial.length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#64748b', padding: '8px', fontStyle: 'italic' }}>No hay registros de cambios de estado para esta tarea.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '8px', borderLeft: '2px solid #e2e8f0' }}>
                      {historial.map((h: any) => (
                        <div key={h.id} style={{ position: 'relative', fontSize: '13px', color: '#475569' }}>
                          {/* Punto indicador */}
                          <div style={{
                            position: 'absolute', left: '-13px', top: '4px', width: '8px', height: '8px',
                            borderRadius: '50%', backgroundColor: '#cbd5e1', border: '2px solid #ffffff'
                          }} />
                          
                          <div>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{h.usuarioNombre}</span> cambió de{' '}
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', padding: '1px 5px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                              {LABEL_ESTADO[h.estadoAnterior] ?? h.estadoAnterior}
                            </span>{' '}
                            a{' '}
                            <span className={ESTADOS[h.estadoNuevo] ?? 'ws-badge'} style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {LABEL_ESTADO[h.estadoNuevo] ?? h.estadoNuevo}
                            </span>
                          </div>
                          
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', fontStyle: 'italic' }}>
                            &ldquo;{h.motivo}&rdquo;
                          </div>

                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            {h.fechaCambio ? new Date(h.fechaCambio).toLocaleString() : '—'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="ws-modal-footer" style={{ borderTop: '1px solid #f1f5f9', marginTop: '20px', paddingTop: '12px' }}>
                <button className="ws-btn-secondary" onClick={() => setTareaDetalle(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}

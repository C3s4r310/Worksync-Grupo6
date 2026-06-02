"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Tarea } from '@/types/tarea';
import { PRIORIDAD_CONFIG } from '@/types/tarea';
import type { Proyecto } from '@/types/proyecto';
import { buscarTareas, cambiarEstadoTarea } from '@/services/tareaService';
import { buscarProyectos } from '@/services/proyectoService';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const BADGE_ESTADOS: Record<string, string> = {
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

export default function GlobalTareasPage() {
  const router = useRouter();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Modal para motivo de cambio de estado (RF-05)
  const [modalEstado, setModalEstado] = useState<{ id: number; nuevoEstado: string } | null>(null);
  const [motivoCambio, setMotivoCambio] = useState('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState<number | undefined>(undefined);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const limitePorPagina = 10;

  useEffect(() => {
    cargarProyectos();
  }, []);

  useEffect(() => {
    cargarTareas();
  }, [filtroProyecto, filtroEstado, filtroPrioridad, paginaActual]);

  const cargarProyectos = async () => {
    try {
      const res = await buscarProyectos({ size: 100 });
      setProyectos(res.content || []);
    } catch (e) {
      console.error('Error al cargar proyectos:', e);
    }
  };

  const cargarTareas = async () => {
    try {
      setCargando(true);
      setError('');
      const res = await buscarTareas(filtroProyecto, {
        estado: filtroEstado || undefined,
        prioridad: filtroPrioridad || undefined,
        palabraClave: busqueda || undefined,
        page: paginaActual,
        size: limitePorPagina
      });
      setTareas(res.content || []);
      setTotalPaginas(res.totalPages || 1);
      setTotalElementos(res.totalElements || 0);
    } catch {
      setError('No se pudieron cargar las tareas globales.');
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPaginaActual(0);
    cargarTareas();
  };

  const handleIntentarCambiarEstado = (id: number, nuevoEstado: string) => {
    const t = tareas.find(x => x.id === id);
    if (t && t.estado === nuevoEstado) return;
    setModalEstado({ id, nuevoEstado });
    setMotivoCambio('');
  };

  const confirmarCambioEstado = async () => {
    if (!modalEstado) return;
    if (!motivoCambio.trim()) return;
    setGuardandoEstado(true);
    try {
      setError('');
      const actualizada = await cambiarEstadoTarea(modalEstado.id, modalEstado.nuevoEstado, motivoCambio);
      setTareas(prev => prev.map(t => t.id === modalEstado.id ? actualizada : t));
      setModalEstado(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cambiar el estado.');
    } finally {
      setGuardandoEstado(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="ws-page-header">
          <div>
            <h1 className="ws-page-title">Centro de Tareas</h1>
            <p className="ws-page-subtitle">Monitorea y actualiza todas las tareas de tus proyectos en tiempo real</p>
          </div>
        </div>

        {/* Panel de Filtros */}
        <form onSubmit={handleBuscar} className="ws-filters" style={{ flexWrap: 'wrap', gap: '12px' }}>
          {/* Búsqueda por texto */}
          <div className="ws-search-wrap" style={{ flex: '1 1 250px' }}>
            <span className="ws-search-icon">🔍</span>
            <input
              className="ws-search-input"
              placeholder="Buscar por palabra clave..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          {/* Filtrar por Proyecto */}
          <select
            className="ws-select"
            value={filtroProyecto || ''}
            onChange={e => {
              setFiltroProyecto(e.target.value ? Number(e.target.value) : undefined);
              setPaginaActual(0);
            }}
            style={{ flex: '1 1 180px' }}
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          {/* Filtrar por Estado */}
          <select
            className="ws-select"
            value={filtroEstado}
            onChange={e => {
              setFiltroEstado(e.target.value);
              setPaginaActual(0);
            }}
            style={{ flex: '1 1 150px' }}
          >
            <option value="">Todos los estados</option>
            {Object.keys(LABEL_ESTADO).map(e => (
              <option key={e} value={e}>{LABEL_ESTADO[e]}</option>
            ))}
          </select>

          {/* Filtrar por Prioridad */}
          <select
            className="ws-select"
            value={filtroPrioridad}
            onChange={e => {
              setFiltroPrioridad(e.target.value);
              setPaginaActual(0);
            }}
            style={{ flex: '1 1 150px' }}
          >
            <option value="">Todas las prioridades</option>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica</option>
          </select>

          <button type="submit" className="ws-btn-primary" style={{ padding: '8px 16px' }}>
            Buscar
          </button>
        </form>

        {error && (
          <div style={{
            color: '#ef4444',
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Tabla de Tareas */}
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Proyecto</th>
                <th>Responsable</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acción Rápida</th>
                <th>Ver</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={7} className="ws-empty">Cargando tareas globales...</td></tr>
              ) : tareas.length === 0 ? (
                <tr><td colSpan={7} className="ws-empty">No se encontraron tareas en este criterio.</td></tr>
              ) : (
                tareas.map(t => {
                  const pri = PRIORIDAD_CONFIG[t.prioridad];
                  const priClass = `ws-prioridad ws-prioridad-${t.prioridad.toLowerCase()}`;
                  // Encontrar nombre del proyecto
                  const projName = proyectos.find(p => p.id === t.proyectoId)?.nombre ?? `Proyecto #${t.proyectoId}`;

                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 500 }}>{t.titulo}</td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>{projName}</td>
                      <td style={{ color: '#475569' }}>{t.responsableId ?? 'Sin asignar'}</td>
                      <td>
                        <span className={priClass}>
                          {PRIORIDAD_ICONO[t.prioridad]} {pri?.label || t.prioridad}
                        </span>
                      </td>
                      <td>
                        <span className={BADGE_ESTADOS[t.estado] ?? 'ws-badge'}>
                          {LABEL_ESTADO[t.estado] ?? t.estado}
                        </span>
                      </td>
                      <td>
                        <select
                          className="ws-select"
                          value={t.estado}
                          onChange={e => handleIntentarCambiarEstado(t.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            height: 'auto',
                            minWidth: '120px'
                          }}
                        >
                          {Object.keys(LABEL_ESTADO).map(stateKey => (
                            <option key={stateKey} value={stateKey}>
                              Cambiar a: {LABEL_ESTADO[stateKey]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="ws-btn-icon"
                          title="Ir al proyecto"
                          onClick={() => router.push(`/proyectos/${t.proyectoId}/tareas`)}
                        >
                          👁
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="ws-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
            <span>
              Mostrando {tareas.length} de {totalElementos} tareas totales
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="ws-btn-secondary"
                disabled={paginaActual === 0}
                onClick={() => setPaginaActual(p => Math.max(0, p - 1))}
                style={{ padding: '4px 12px', fontSize: '13px' }}
              >
                ◀ Anterior
              </button>
              <span style={{ alignSelf: 'center', fontSize: '14px', fontWeight: 500 }}>
                Página {paginaActual + 1} de {totalPaginas}
              </span>
              <button
                className="ws-btn-secondary"
                disabled={paginaActual >= totalPaginas - 1}
                onClick={() => setPaginaActual(p => Math.min(totalPaginas - 1, p + 1))}
                style={{ padding: '4px 12px', fontSize: '13px' }}
              >
                Siguiente ▶
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Motivo de Cambio de Estado (RF-05) */}
        {modalEstado && (
          <div className="ws-modal-overlay" onClick={() => setModalEstado(null)}>
            <div className="ws-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
              <div className="ws-modal-header">
                <h2 className="ws-modal-title">Justificar cambio</h2>
                <button className="ws-modal-close" onClick={() => setModalEstado(null)}>✕</button>
              </div>
              <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
                Estás cambiando el estado de la tarea a <strong>{LABEL_ESTADO[modalEstado.nuevoEstado] ?? modalEstado.nuevoEstado}</strong>. Por favor, escribe la justificación para registrarla en la bitácora de auditoría.
              </p>
              <div className="ws-field">
                <label>Motivo del cambio *</label>
                <textarea
                  value={motivoCambio}
                  onChange={e => setMotivoCambio(e.target.value)}
                  placeholder="Ej. Se realizaron las pruebas unitarias y se validó en desarrollo o la tarea se bloquea por falta de credenciales..."
                  style={{ minHeight: '80px', width: '100%', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div className="ws-modal-footer" style={{ marginTop: '20px' }}>
                <button className="ws-btn-secondary" onClick={() => setModalEstado(null)}>Cancelar</button>
                <button className="ws-btn-primary" onClick={confirmarCambioEstado} disabled={guardandoEstado || !motivoCambio.trim()}>
                  {guardandoEstado ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}

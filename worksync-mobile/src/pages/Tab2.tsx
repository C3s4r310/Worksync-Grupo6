import React, { useEffect, useState, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSpinner
} from '@ionic/react';
import {
  buscarTareas,
  crearTarea,
  cambiarEstadoTarea,
  obtenerHistorialTarea,
  listarSubtareas,
  listarComentarios,
  agregarComentario
} from '../services/tareaService';
import { buscarProyectos } from '../services/proyectoService';
import { obtenerUsuarios, UsuarioDTO } from '../services/usuarioService';
import type { Tarea, Prioridad, Comentario } from '../types/tarea';
import type { Proyecto } from '../types/proyecto';
import './Tab2.css';

const LABEL_ESTADO: Record<string, string> = {
  PENDIENTE:   'Pendiente',
  EN_PROGRESO: 'En progreso',
  EN_REVISION: 'En revisión',
  COMPLETADA:  'Completado',
};

const PRIORIDAD_ICONO: Record<string, string> = {
  BAJA: '↓', MEDIA: '→', ALTA: '↑', CRITICA: '↑↑',
};

const Tab2: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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

  // Modales
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEstado, setModalEstado] = useState<{ id: number; nuevoEstado: string } | null>(null);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [activeTabDetail, setActiveTabDetail] = useState<'detail' | 'subtasks' | 'comments' | 'history'>('detail');

  // Datos para Crear Tarea
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevaPrioridad, setNuevaPrioridad] = useState<Prioridad>('MEDIA');
  const [nuevoProyId, setNuevoProyId] = useState<number>(0);
  const [nuevoRespId, setNuevoRespId] = useState<number | undefined>(undefined);
  const [nuevaFechaLim, setNuevaFechaLim] = useState('');
  const [creandoTask, setCreandoTask] = useState(false);

  // Motivo cambio de estado (RF-05)
  const [motivoCambio, setMotivoCambio] = useState('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  // Detalles de tarea (Subtareas, comentarios, historial)
  const [subtareas, setSubtareas] = useState<Tarea[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [historialLogs, setHistorialLogs] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  // Datos para subtarea
  const [nuevaSubtitulo, setNuevaSubtitulo] = useState('');
  const [creandoSubtask, setCreandoSubtask] = useState(false);
  const [mostrarFormSubtarea, setMostrarFormSubtarea] = useState(false);

  useEffect(() => {
    cargarCatalogos();
  }, []);

  useEffect(() => {
    cargarTareas();
  }, [filtroProyecto, filtroEstado, filtroPrioridad, paginaActual]);

  const cargarCatalogos = async () => {
    // 1. Cargar proyectos de manera segura
    try {
      const resProy = await buscarProyectos({ size: 100 });
      const projs = resProy.content || [];
      setProyectos(projs);
      
      if (projs.length > 0) {
        setNuevoProyId(projs[0].id);
      }
    } catch (e) {
      console.error('Error al cargar proyectos:', e);
    }

    // 2. Cargar usuarios (puede fallar con 403 si el rol no es ADMIN, lo cual es normal)
    try {
      const resUser = await obtenerUsuarios();
      setUsuarios(resUser || []);
    } catch (e) {
      console.warn('No se pudieron obtener los usuarios del sistema (permiso restringido):', e);
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
      setError('No se pudieron cargar las tareas.');
    } finally {
      setCargando(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPaginaActual(0);
    cargarTareas();
  };

  // Creación de tareas
  const handleCrearTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeProyectoId = nuevoProyId || (proyectos.length > 0 ? proyectos[0].id : 0);
    if (!nuevoTitulo.trim() || !activeProyectoId) return;
    setCreandoTask(true);
    setError('');

    try {
      await crearTarea({
        titulo: nuevoTitulo,
        descripcion: nuevaDesc || undefined,
        prioridad: nuevaPrioridad,
        proyectoId: activeProyectoId,
        responsableId: nuevoRespId || undefined,
        fechaLimite: nuevaFechaLim || undefined
      });
      setModalCrear(false);
      setNuevoTitulo('');
      setNuevaDesc('');
      setNuevaPrioridad('MEDIA');
      setNuevoRespId(undefined);
      setNuevaFechaLim('');
      cargarTareas();
    } catch (err: any) {
      setError(err.message || 'Error al crear la tarea');
    } finally {
      setCreandoTask(false);
    }
  };

  // Cambio de estado
  const handleIntentarCambiarEstado = (id: number, nuevoEstado: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation(); // Evitar abrir el modal de detalles
    const t = tareas.find(x => x.id === id);
    if (t && t.estado === nuevoEstado) return;
    setModalEstado({ id, nuevoEstado });
    setMotivoCambio('');
  };

  const confirmarCambioEstado = async () => {
    if (!modalEstado || !motivoCambio.trim()) return;
    setGuardandoEstado(true);
    try {
      setError('');
      const actualizada = await cambiarEstadoTarea(modalEstado.id, modalEstado.nuevoEstado, motivoCambio);
      setTareas(prev => prev.map(t => t.id === modalEstado.id ? actualizada : t));
      
      // Si la tarea editada es la que está abierta en detalles, actualizarla también
      if (tareaSeleccionada && tareaSeleccionada.id === modalEstado.id) {
        setTareaSeleccionada(actualizada);
        cargarHistorial(modalEstado.id); // Recargar auditoría
      }
      setModalEstado(null);
    } catch (e: any) {
      setError(e.message || 'Error al cambiar el estado.');
    } finally {
      setGuardandoEstado(false);
    }
  };

  // Carga de pestañas de detalles
  const abrirDetalles = async (tarea: Tarea) => {
    setTareaSeleccionada(tarea);
    setActiveTabDetail('detail');
    setMostrarFormSubtarea(false);
    setNuevaSubtitulo('');
    cargarSubtareas(tarea.id);
    cargarComentarios(tarea.id);
    cargarHistorial(tarea.id);
  };

  const cargarSubtareas = async (tareaId: number) => {
    try {
      const res = await listarSubtareas(tareaId);
      setSubtareas(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  const cargarComentarios = async (tareaId: number) => {
    try {
      const res = await listarComentarios(tareaId);
      setComentarios(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  const cargarHistorial = async (tareaId: number) => {
    try {
      const res = await obtenerHistorialTarea(tareaId);
      setHistorialLogs(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Agregar Comentario
  const handleAgregarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !tareaSeleccionada) return;
    setEnviandoComentario(true);

    try {
      const comentarioAgregado = await agregarComentario(tareaSeleccionada.id, nuevoComentario.trim());
      setComentarios(prev => [...prev, comentarioAgregado]);
      setNuevoComentario('');
    } catch (err: any) {
      console.error('Error al agregar comentario:', err);
    } finally {
      setEnviandoComentario(false);
    }
  };

  // Agregar Subtarea
  const handleAgregarSubtarea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaSubtitulo.trim() || !tareaSeleccionada) return;
    setCreandoSubtask(true);

    try {
      const sub = await crearTarea({
        titulo: nuevaSubtitulo.trim(),
        proyectoId: tareaSeleccionada.proyectoId,
        prioridad: 'MEDIA',
        tareaPadreId: tareaSeleccionada.id
      });
      setSubtareas(prev => [...prev, sub]);
      setNuevaSubtitulo('');
      setMostrarFormSubtarea(false);
    } catch (err: any) {
      console.error('Error al crear subtarea:', err);
    } finally {
      setCreandoSubtask(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tareas del Proyecto</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="tareas-page-content ion-no-padding">
        
        {/* Encabezado Descriptivo */}
        <div className="tareas-header">
          <h2>Centro de Tareas</h2>
          <p>Gestiona, filtra y actualiza el progreso de tus tareas asignadas en tiempo real.</p>
        </div>

        {/* Panel de Filtros */}
        <div className="tareas-filters-bar">
          <form onSubmit={handleBuscar} className="tareas-search-box">
            <span className="tareas-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por palabra clave..."
              className="tareas-search-input"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </form>

          <div className="tareas-selects-row">
            <select
              className="tareas-filter-select"
              value={filtroProyecto || ''}
              onChange={e => {
                setFiltroProyecto(e.target.value ? Number(e.target.value) : undefined);
                setPaginaActual(0);
              }}
            >
              <option value="">Todos los proyectos</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>

            <select
              className="tareas-filter-select"
              value={filtroEstado}
              onChange={e => {
                setFiltroEstado(e.target.value);
                setPaginaActual(0);
              }}
            >
              <option value="">Todos los estados</option>
              {Object.keys(LABEL_ESTADO).map(k => (
                <option key={k} value={k}>{LABEL_ESTADO[k]}</option>
              ))}
            </select>

            <select
              className="tareas-filter-select"
              value={filtroPrioridad}
              onChange={e => {
                setFiltroPrioridad(e.target.value);
                setPaginaActual(0);
              }}
            >
              <option value="">Todas las prioridades</option>
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="CRITICA">Crítica</option>
            </select>

            <button onClick={handleBuscar} className="tareas-btn-search">
              Filtrar
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            color: '#f87171',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px',
            borderRadius: '8px',
            margin: '16px 16px 0 16px',
            fontSize: '13px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Listado de Tareas */}
        <div className="tareas-list-container">
          {cargando ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <IonSpinner name="crescent" color="primary" />
            </div>
          ) : tareas.length === 0 ? (
            <div className="sidebar-empty">
              <span className="icon">📋</span>
              <p>No se encontraron tareas con los filtros seleccionados.</p>
            </div>
          ) : (
            tareas.map(t => {
              const projName = proyectos.find(p => p.id === t.proyectoId)?.nombre ?? `Proyecto #${t.proyectoId}`;
              const respName = usuarios.find(u => u.id === t.responsableId)?.nombre ?? (t.responsableId ? `Usuario #${t.responsableId}` : 'Sin asignar');

              return (
                <div key={t.id} className="tarea-card" onClick={() => abrirDetalles(t)}>
                  <div>
                    <span className="tarea-card-proj">{projName}</span>
                    <h3 className="tarea-card-title">{t.titulo}</h3>
                  </div>

                  <div className="tarea-badges-row">
                    <span className={`badge-prioridad ${t.prioridad.toLowerCase()}`}>
                      {PRIORIDAD_ICONO[t.prioridad]} {t.prioridad}
                    </span>
                    <span className={`badge-estado ${t.estado.toLowerCase()}`}>
                      {LABEL_ESTADO[t.estado] ?? t.estado}
                    </span>
                  </div>

                  <div className="tarea-card-meta">
                    <span className="tarea-card-user">👤 {respName}</span>
                  </div>

                  {/* Selector rápido de estado */}
                  <div className="tarea-status-select-wrap">
                    <select
                      className="tarea-card-status-select"
                      value={t.estado}
                      onClick={e => e.stopPropagation()} // Detener clic para no abrir modal detalles
                      onChange={e => handleIntentarCambiarEstado(t.id, e.target.value, e)}
                    >
                      {Object.keys(LABEL_ESTADO).map(s => (
                        <option key={s} value={s}>Cambiar a: {LABEL_ESTADO[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Paginación */}
        {!cargando && totalPaginas > 1 && (
          <div className="tareas-pagination">
            <span>Elemento {tareas.length} de {totalElementos}</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="tareas-page-btn"
                disabled={paginaActual === 0}
                onClick={() => setPaginaActual(p => Math.max(0, p - 1))}
              >
                ◀
              </button>
              <span>{paginaActual + 1} de {totalPaginas}</span>
              <button
                className="tareas-page-btn"
                disabled={paginaActual >= totalPaginas - 1}
                onClick={() => setPaginaActual(p => Math.min(totalPaginas - 1, p + 1))}
              >
                ▶
              </button>
            </div>
          </div>
        )}

        {/* Botón flotante para crear tarea */}
        <button onClick={() => setModalCrear(true)} className="tareas-fab-btn" title="Nueva tarea">+</button>

        {/* MODAL CREAR TAREA */}
        {modalCrear && (
          <div className="tareas-modal-overlay" onClick={() => setModalCrear(false)}>
            <div className="tareas-modal" onClick={e => e.stopPropagation()}>
              <div className="tareas-modal-header">
                <h3 className="tareas-modal-title">Nueva Tarea</h3>
                <button className="tareas-modal-close-btn" onClick={() => setModalCrear(false)}>✕</button>
              </div>

              <form onSubmit={handleCrearTarea}>
                <div className="tareas-modal-body">
                  <div className="tareas-form-group">
                    <label className="tareas-form-label">Proyecto *</label>
                    <select
                      className="tareas-form-select"
                      value={nuevoProyId}
                      onChange={e => setNuevoProyId(Number(e.target.value))}
                      required
                    >
                      {proyectos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="tareas-form-group">
                    <label className="tareas-form-label">Título *</label>
                    <input
                      type="text"
                      className="tareas-form-input"
                      value={nuevoTitulo}
                      onChange={e => setNuevoTitulo(e.target.value)}
                      placeholder="Título de la tarea"
                      required
                    />
                  </div>

                  <div className="tareas-form-group">
                    <label className="tareas-form-label">Descripción</label>
                    <textarea
                      className="tareas-form-textarea"
                      value={nuevaDesc}
                      onChange={e => setNuevaDesc(e.target.value)}
                      placeholder="Escribe detalles adicionales..."
                    />
                  </div>

                  <div className="tareas-form-group">
                    <label className="tareas-form-label">Prioridad *</label>
                    <select
                      className="tareas-form-select"
                      value={nuevaPrioridad}
                      onChange={e => setNuevaPrioridad(e.target.value as Prioridad)}
                      required
                    >
                      <option value="BAJA">Baja</option>
                      <option value="MEDIA">Media</option>
                      <option value="ALTA">Alta</option>
                      <option value="CRITICA">Crítica</option>
                    </select>
                  </div>

                  <div className="tareas-form-group">
                    <label className="tareas-form-label">Asignar Responsable</label>
                    <select
                      className="tareas-form-select"
                      value={nuevoRespId || ''}
                      onChange={e => setNuevoRespId(e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">Sin asignar</option>
                      {usuarios.map(u => (
                        <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                      ))}
                    </select>
                  </div>

                  <div className="tareas-form-group">
                    <label className="tareas-form-label">Fecha Límite</label>
                    <input
                      type="date"
                      className="tareas-form-input"
                      value={nuevaFechaLim}
                      onChange={e => setNuevaFechaLim(e.target.value)}
                    />
                  </div>
                </div>

                <div className="tareas-modal-footer">
                  <button type="button" className="tareas-page-btn" style={{ background: 'transparent', color: '#64748b' }} onClick={() => setModalCrear(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="tareas-btn-search" disabled={creandoTask || !nuevoTitulo.trim()}>
                    {creandoTask ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL JUSTIFICACIÓN DE CAMBIO DE ESTADO (RF-05) */}
        {modalEstado && (
          <div className="tareas-modal-overlay" onClick={() => setModalEstado(null)}>
            <div className="tareas-modal" onClick={e => e.stopPropagation()}>
              <div className="tareas-modal-header">
                <h3 className="tareas-modal-title">Justificar cambio de estado</h3>
                <button className="tareas-modal-close-btn" onClick={() => setModalEstado(null)}>✕</button>
              </div>

              <div className="tareas-modal-body">
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  Estás cambiando el estado de la tarea a <strong>{LABEL_ESTADO[modalEstado.nuevoEstado] || modalEstado.nuevoEstado}</strong>. Describe el motivo para el registro de auditoría.
                </p>

                <div className="tareas-form-group">
                  <label className="tareas-form-label">Motivo *</label>
                  <textarea
                    className="tareas-form-textarea"
                    value={motivoCambio}
                    onChange={e => setMotivoCambio(e.target.value)}
                    placeholder="Ej: Se realizaron las pruebas unitarias y se validó en desarrollo..."
                    required
                  />
                </div>
              </div>

              <div className="tareas-modal-footer">
                <button type="button" className="tareas-page-btn" style={{ background: 'transparent', color: '#64748b' }} onClick={() => setModalEstado(null)}>
                  Cancelar
                </button>
                <button type="button" className="tareas-btn-search" onClick={confirmarCambioEstado} disabled={guardandoEstado || !motivoCambio.trim()}>
                  {guardandoEstado ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DETALLES COMPLETOS (Tabbed) */}
        {tareaSeleccionada && (
          <div className="tareas-modal-overlay" onClick={() => setTareaSeleccionada(null)}>
            <div className="tareas-modal large" onClick={e => e.stopPropagation()}>
              <div className="tareas-modal-header">
                <h3 className="tareas-modal-title">{tareaSeleccionada.titulo}</h3>
                <button className="tareas-modal-close-btn" onClick={() => setTareaSeleccionada(null)}>✕</button>
              </div>

              {/* Pestañas */}
              <div className="tareas-detail-tabs">
                <button
                  className={`tareas-detail-tab-btn ${activeTabDetail === 'detail' ? 'active' : ''}`}
                  onClick={() => setActiveTabDetail('detail')}
                >
                  Detalles
                </button>
                <button
                  className={`tareas-detail-tab-btn ${activeTabDetail === 'subtasks' ? 'active' : ''}`}
                  onClick={() => setActiveTabDetail('subtasks')}
                >
                  Subtareas ({subtareas.length})
                </button>
                <button
                  className={`tareas-detail-tab-btn ${activeTabDetail === 'comments' ? 'active' : ''}`}
                  onClick={() => setActiveTabDetail('comments')}
                >
                  Comentarios ({comentarios.length})
                </button>
                <button
                  className={`tareas-detail-tab-btn ${activeTabDetail === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTabDetail('history')}
                >
                  Auditoría
                </button>
              </div>

              <div className="tareas-modal-body">
                {/* PESTAÑA DETALLES */}
                {activeTabDetail === 'detail' && (
                  <div className="tab-pane-content">
                    <div className="detail-desc-block">
                      {tareaSeleccionada.descripcion || 'Sin descripción detallada.'}
                    </div>

                    <div className="detail-info-grid">
                      <div className="detail-info-item">
                        <span>Proyecto</span>
                        <p>{proyectos.find(p => p.id === tareaSeleccionada.proyectoId)?.nombre ?? `Proyecto #${tareaSeleccionada.proyectoId}`}</p>
                      </div>
                      <div className="detail-info-item">
                        <span>Responsable</span>
                        <p>{usuarios.find(u => u.id === tareaSeleccionada.responsableId)?.nombre ?? 'Sin asignar'}</p>
                      </div>
                      <div className="detail-info-item">
                        <span>Prioridad</span>
                        <p style={{ fontWeight: 'bold' }}>{tareaSeleccionada.prioridad}</p>
                      </div>
                      <div className="detail-info-item">
                        <span>Estado</span>
                        <p style={{ fontWeight: 'bold' }}>{LABEL_ESTADO[tareaSeleccionada.estado] ?? tareaSeleccionada.estado}</p>
                      </div>
                      <div className="detail-info-item">
                        <span>Fecha Límite</span>
                        <p>{tareaSeleccionada.fechaLimite ? new Date(tareaSeleccionada.fechaLimite).toLocaleDateString('es-ES') : 'Sin fecha límite'}</p>
                      </div>
                      <div className="detail-info-item">
                        <span>Creado el</span>
                        <p>{new Date(tareaSeleccionada.fechaCreacion).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PESTAÑA SUBTAREAS */}
                {activeTabDetail === 'subtasks' && (
                  <div className="tab-pane-content">
                    <div className="subtasks-list">
                      {subtareas.length === 0 ? (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center' }}>Esta tarea no tiene subtareas asociadas.</p>
                      ) : (
                        subtareas.map(sub => (
                          <div key={sub.id} className="subtask-item">
                            <span className="subtask-title">{sub.titulo}</span>
                            <span className={`badge-estado ${sub.estado.toLowerCase()} subtask-status`}>
                              {LABEL_ESTADO[sub.estado] ?? sub.estado}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Botón para desplegar formulario de nueva subtarea */}
                    {!mostrarFormSubtarea ? (
                      <button
                        onClick={() => setMostrarFormSubtarea(true)}
                        className="tareas-btn-search"
                        style={{ marginTop: '14px', width: '100%' }}
                      >
                        + Agregar Subtarea
                      </button>
                    ) : (
                      <form onSubmit={handleAgregarSubtarea} style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={nuevaSubtitulo}
                          onChange={e => setNuevaSubtitulo(e.target.value)}
                          placeholder="Nombre de la subtarea..."
                          className="comment-text-input"
                          required
                        />
                        <button type="submit" className="tareas-btn-search" disabled={creandoSubtask || !nuevaSubtitulo.trim()}>
                          {creandoSubtask ? '...' : 'Añadir'}
                        </button>
                        <button type="button" className="tareas-page-btn" style={{ background: '#1e293b' }} onClick={() => setMostrarFormSubtarea(false)}>
                          ✕
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* PESTAÑA COMENTARIOS */}
                {activeTabDetail === 'comments' && (
                  <div className="tab-pane-content">
                    <div className="comments-thread">
                      {comentarios.length === 0 ? (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center' }}>No hay comentarios aún. ¡Escribe el primero!</p>
                      ) : (
                        comentarios.map(c => (
                          <div key={c.id} className="comment-bubble">
                            <div className="comment-header">
                              <span className="comment-user">{c.usuarioNombre || `Usuario #${c.usuarioId}`}</span>
                              <span>{new Date(c.fechaCreacion).toLocaleDateString('es-ES')} a las {new Date(c.fechaCreacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="comment-text">{c.contenido}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleAgregarComentario} className="comment-input-form">
                      <input
                        type="text"
                        placeholder="Escribe un comentario..."
                        className="comment-text-input"
                        value={nuevoComentario}
                        onChange={e => setNuevoComentario(e.target.value)}
                        required
                      />
                      <button type="submit" className="comment-send-btn" disabled={enviandoComentario || !nuevoComentario.trim()}>
                        {enviandoComentario ? '...' : 'Enviar'}
                      </button>
                    </form>
                  </div>
                )}

                {/* PESTAÑA HISTORIAL / AUDITORÍA */}
                {activeTabDetail === 'history' && (
                  <div className="tab-pane-content">
                    <div className="history-timeline">
                      {historialLogs.length === 0 ? (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center' }}>No se han registrado cambios de estado para esta tarea.</p>
                      ) : (
                        historialLogs.map((log: any) => (
                          <div key={log.id} className="history-item">
                            <div className="history-header">
                              <strong>{log.usuarioNombre || `Usuario #${log.usuarioId}`}</strong> • {new Date(log.fecha).toLocaleDateString('es-ES')} a las {new Date(log.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <p className="history-desc">
                              Cambió el estado de <code>{LABEL_ESTADO[log.estadoAnterior] || log.estadoAnterior || 'Inicio'}</code> a <code>{LABEL_ESTADO[log.estadoNuevo] || log.estadoNuevo}</code>.
                            </p>
                            {log.motivo && <p className="history-motif">" {log.motivo} "</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="tareas-modal-footer">
                <button type="button" className="tareas-page-btn" onClick={() => setTareaSeleccionada(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab2;

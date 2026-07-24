"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Tarea, TareaRequest, Comentario, Prioridad } from '@/types/tarea';
import { PRIORIDAD_CONFIG } from '@/types/tarea';
import { 
  listarTareasPorProyecto, 
  crearTarea, 
  actualizarTarea, 
  eliminarTarea,
  obtenerHistorialTarea,
  listarComentarios,
  agregarComentario,
  subirEvidenciaArchivo,
  agregarEvidenciaUrl,
  listarSubtareas
} from '@/services/tareaService';
import { listarMiembros, MiembroDTO } from '@/services/miembroService';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import TareaForm from '@/components/tareas/TareaForm';
import TareaBoard from '@/components/tareas/TareaBoard';
import useAuth from '@/hooks/useAuth';

const ESTADOS: Record<string, string> = {
  PENDIENTE:   'ws-badge ws-badge-pendiente',
  EN_PROGRESO: 'ws-badge ws-badge-progreso',
  BLOQUEADA:   'ws-badge ws-badge-bloqueada',
  EN_REVISION: 'ws-badge ws-badge-revision',
  OBSERVADA:   'ws-badge ws-badge-observada',
  COMPLETADA:  'ws-badge ws-badge-completada',
  CANCELADA:   'ws-badge ws-badge-cancelada',
};

const LABEL_ESTADO: Record<string, string> = {
  PENDIENTE:   'Pendiente',
  EN_PROGRESO: 'En progreso',
  BLOQUEADA:   'Bloqueada',
  EN_REVISION: 'En revisión',
  OBSERVADA:   'Observada',
  COMPLETADA:  'Completado',
  CANCELADA:   'Cancelado',
};

const PRIORIDAD_ICONO: Record<string, string> = {
  BAJA: '↓', MEDIA: '→', ALTA: '↑', CRITICA: '↑↑',
};

// RF-03 Gestión de Tareas: CRUD básico y vistas.
// RF-04 Asignación Inteligente: Selección de miembros responsables del proyecto.
// RF-05 Control de Estados & RF-10 Tablero Kanban: Cambios de estado y visualización interactiva en tablero.
// RF-06 Evidencias & RF-18 Comentarios: Adjunto de archivos, enlaces URL e hilos de conversación.
// RF-11 Dependencias, RF-13 Bloqueos & RF-15 Subtareas: Relaciones, prerrequisitos y desglose.
// RF-14 Priorización: Visualización e iconografía de niveles de prioridad de tareas.
// RF-17 Historial: Visualización de bitácora y auditoría de cambios de estado.
export default function TareasPage() {
  const { user } = useAuth();
  const esGestor = user?.rol === 'ADMIN' || user?.rol === 'LIDER';
  
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
  
  // Toggle de Vista (Kanban / Tabla)
  const [vista, setVista] = useState<'kanban' | 'lista'>('kanban');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tareaEditar, setTareaEditar] = useState<Tarea | null>(null);

  // Consulta de Detalles de Tarea (RF-03, RF-05, RF-15, RF-18, RF-06)
  const [tareaDetalle, setTareaDetalle] = useState<Tarea | null>(null);
  
  // Auditoría e historial
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Comentarios
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [cargandoComentarios, setCargandoComentarios] = useState(false);

  // Subtareas
  const [subtareas, setSubtareas] = useState<Tarea[]>([]);
  const [cargandoSubtareas, setCargandoSubtareas] = useState(false);
  const [nuevaSubtareaTitulo, setNuevaSubtareaTitulo] = useState('');
  const [nuevaSubtareaPrioridad, setNuevaSubtareaPrioridad] = useState<Prioridad>('MEDIA');
  const [nuevaSubtareaResponsable, setNuevaSubtareaResponsable] = useState<number | ''>('');
  const [creandoSubtarea, setCreandoSubtarea] = useState(false);

  // Evidencias
  const [nuevaEvidenciaUrl, setNuevaEvidenciaUrl] = useState('');
  const [archivoEvidencia, setArchivoEvidencia] = useState<File | null>(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  useEffect(() => {
    if (idProyecto) {
      cargar();
      cargarMiembros();
    }
  }, [idProyecto]);

  // Cargar detalles asociados a la tarea al seleccionarla
  useEffect(() => {
    async function cargarDetallesAsociados() {
      if (!tareaDetalle) {
        setHistorial([]);
        setComentarios([]);
        setSubtareas([]);
        return;
      }
      
      const tid = tareaDetalle.id;
      
      // Historial
      try {
        setCargandoHistorial(true);
        const dataHist = await obtenerHistorialTarea(tid);
        setHistorial(dataHist || []);
      } catch (err) {
        console.error('Error al cargar historial:', err);
      } finally {
        setCargandoHistorial(false);
      }

      // Comentarios
      try {
        setCargandoComentarios(true);
        const dataCom = await listarComentarios(tid);
        setComentarios(dataCom || []);
      } catch (err) {
        console.error('Error al cargar comentarios:', err);
      } finally {
        setCargandoComentarios(false);
      }

      // Subtareas
      try {
        setCargandoSubtareas(true);
        const dataSubs = await listarSubtareas(tid);
        setSubtareas(dataSubs || []);
      } catch (err) {
        console.error('Error al cargar subtareas:', err);
      } finally {
        setCargandoSubtareas(false);
      }
    }
    
    cargarDetallesAsociados();
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

  // Enviar comentario
  const handleAddComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !tareaDetalle) return;
    try {
      const creado = await agregarComentario(tareaDetalle.id, nuevoComentario.trim());
      setComentarios(prev => [...prev, creado]);
      setNuevoComentario('');
    } catch (err) {
      console.error('Error al agregar comentario:', err);
      alert('Error al agregar comentario.');
    }
  };

  // Crear Subtarea
  const handleCrearSubtarea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaSubtareaTitulo.trim() || !tareaDetalle) return;
    try {
      setCreandoSubtarea(true);
      const req: TareaRequest = {
        titulo: nuevaSubtareaTitulo.trim(),
        prioridad: nuevaSubtareaPrioridad,
        proyectoId: idProyecto,
        tareaPadreId: tareaDetalle.id,
        responsableId: nuevaSubtareaResponsable ? Number(nuevaSubtareaResponsable) : undefined,
        dependencias: [],
        evidencias: []
      };
      const nuevaSub = await crearTarea(req);
      setSubtareas(prev => [...prev, nuevaSub]);
      setTareas(prev => [...prev, nuevaSub]);
      
      setNuevaSubtareaTitulo('');
      setNuevaSubtareaResponsable('');
      setNuevaSubtareaPrioridad('MEDIA');
    } catch (err: any) {
      alert(err.message || 'Error al crear la subtarea.');
    } finally {
      setCreandoSubtarea(false);
    }
  };

  // Subir Archivo Evidencia
  const handleSubirEvidencia = async () => {
    if (!archivoEvidencia || !tareaDetalle) return;
    try {
      setSubiendoArchivo(true);
      const res = await subirEvidenciaArchivo(tareaDetalle.id, archivoEvidencia);
      
      const nuevasEvidencias = [...(tareaDetalle.evidencias || []), res.url];
      setTareaDetalle(prev => prev ? { ...prev, evidencias: nuevasEvidencias } : null);
      setTareas(prev => prev.map(t => t.id === tareaDetalle.id ? { ...t, evidencias: nuevasEvidencias } : t));
      
      setArchivoEvidencia(null);
      const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      alert('Archivo subido con éxito.');
    } catch (err) {
      console.error(err);
      alert('Error al subir el archivo de evidencia.');
    } finally {
      setSubiendoArchivo(false);
    }
  };

  // Registrar Evidencia URL
  const handleAddEvidenciaUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaEvidenciaUrl.trim() || !tareaDetalle) return;
    try {
      const actualizada = await agregarEvidenciaUrl(tareaDetalle.id, nuevaEvidenciaUrl.trim());
      setTareaDetalle(prev => prev ? { ...prev, evidencias: actualizada.evidencias } : null);
      setTareas(prev => prev.map(t => t.id === tareaDetalle.id ? { ...t, evidencias: actualizada.evidencias } : t));
      setNuevaEvidenciaUrl('');
      alert('Enlace agregado con éxito.');
    } catch (err) {
      console.error(err);
      alert('Error al registrar la URL de evidencia.');
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="ws-page-header">
          <div>
            <h1 className="ws-page-title">Tareas del Proyecto #{idProyecto}</h1>
            <p className="ws-page-subtitle">Gestiona las tareas del equipo y consulta sus dependencias, subtareas e historial.</p>
          </div>
          {vista === 'lista' && (
            <button 
              className="ws-btn-primary" 
              onClick={abrirCrear}
              disabled={!esGestor}
              style={{ opacity: esGestor ? 1 : 0.5, cursor: esGestor ? 'pointer' : 'not-allowed' }}
              title={!esGestor ? "Solo Administradores y Líderes pueden crear tareas" : undefined}
            >
              + Nueva Tarea
            </button>
          )}
        </div>

        {/* Toggle de Vistas */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <button 
            className={vista === 'kanban' ? 'ws-btn-primary' : 'ws-btn-secondary'}
            onClick={() => setVista('kanban')}
            style={{ fontSize: '13.5px', padding: '6px 16px', borderRadius: '6px', fontWeight: 600 }}
          >
            📊 Tablero Kanban
          </button>
          <button 
            className={vista === 'lista' ? 'ws-btn-primary' : 'ws-btn-secondary'}
            onClick={() => setVista('lista')}
            style={{ fontSize: '13.5px', padding: '6px 16px', borderRadius: '6px', fontWeight: 600 }}
          >
            📋 Vista Lista (Tabla)
          </button>
        </div>

        {vista === 'lista' ? (
          <>
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
                              <button 
                                className="ws-btn-icon" 
                                title="Editar" 
                                onClick={e => abrirEditar(t, e)}
                                disabled={!esGestor}
                                style={{ opacity: esGestor ? 1 : 0.4, cursor: esGestor ? 'pointer' : 'not-allowed' }}
                              >
                                ✏️
                              </button>
                              <button 
                                className="ws-btn-icon danger" 
                                title="Eliminar" 
                                onClick={e => eliminar(t.id, e)}
                                disabled={!esGestor}
                                style={{ opacity: esGestor ? 1 : 0.4, cursor: esGestor ? 'pointer' : 'not-allowed' }}
                              >
                                🗑️
                              </button>
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
          </>
        ) : (
          <TareaBoard 
            proyectoId={idProyecto} 
            nombreProyecto={`Proyecto #${idProyecto}`}
            filtros={{
              estado: filtroEstado || undefined,
              prioridad: filtroPrioridad || undefined,
              palabraClave: busqueda || undefined
            }}
            onVerDetalle={setTareaDetalle}
            esGestor={esGestor}
          />
        )}

        {/* Modal Tarea Form (Crear/Editar) */}
        {modalAbierto && (
          <TareaForm
            proyectoId={idProyecto}
            tareaEditar={tareaEditar}
            onGuardar={guardar}
            onCancelar={cerrar}
          />
        )}

        {/* Modal Ampliado de Detalles de Tarea (Sprint 2) */}
        {tareaDetalle && (
          <div className="ws-modal-overlay" onClick={() => setTareaDetalle(null)}>
            <div 
              className="ws-modal" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}
            >
              <div className="ws-modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <h2 className="ws-modal-title" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Detalles de la Tarea #{tareaDetalle.id}
                </h2>
                <button className="ws-modal-close" onClick={() => setTareaDetalle(null)}>✕</button>
              </div>

              {/* Contenido en dos columnas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '16px' }}>
                
                {/* Columna Izquierda: Detalles, Subtareas, Evidencias, Comentarios */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Título & Descripción */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                      {tareaDetalle.titulo}
                    </h3>
                    <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {tareaDetalle.descripcion || 'Sin descripción detallada.'}
                    </p>
                  </div>

                  {/* Subtareas (RF-15) */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📂</span> Subtareas
                    </h4>
                    {cargandoSubtareas ? (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cargando subtareas...</div>
                    ) : subtareas.length === 0 ? (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '10px' }}>Esta tarea no tiene subtareas asociadas.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                        {subtareas.map(sub => (
                          <div 
                            key={sub.id} 
                            style={{ 
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '6px',
                              border: '1px solid var(--border)', fontSize: '13px'
                            }}
                          >
                            <span style={{ fontWeight: 550, textDecoration: sub.estado === 'COMPLETADA' ? 'line-through' : 'none', color: 'var(--text-primary)' }}>
                              {sub.titulo}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className={ESTADOS[sub.estado] ?? 'ws-badge'} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                {LABEL_ESTADO[sub.estado] ?? sub.estado}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                {PRIORIDAD_ICONO[sub.prioridad]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulario rápido para agregar subtarea */}
                    <form onSubmit={handleCrearSubtarea} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nueva Subtarea Rápida</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input 
                          type="text" 
                          placeholder="Nombre de subtarea..."
                          value={nuevaSubtareaTitulo}
                          onChange={e => setNuevaSubtareaTitulo(e.target.value)}
                          className="ws-search-input"
                          style={{ flex: 1, fontSize: '13px', padding: '6px 10px' }}
                          required
                          disabled={!esGestor}
                        />
                        <select 
                          value={nuevaSubtareaPrioridad}
                          onChange={e => setNuevaSubtareaPrioridad(e.target.value as Prioridad)}
                          className="ws-select"
                          style={{ fontSize: '13px', padding: '6px' }}
                          disabled={!esGestor}
                        >
                          <option value="BAJA">Baja</option>
                          <option value="MEDIA">Media</option>
                          <option value="ALTA">Alta</option>
                          <option value="CRITICA">Crítica</option>
                        </select>
                        <select 
                          value={nuevaSubtareaResponsable}
                          onChange={e => setNuevaSubtareaResponsable(e.target.value ? Number(e.target.value) : '')}
                          className="ws-select"
                          style={{ fontSize: '13px', padding: '6px', maxWidth: '130px' }}
                          disabled={!esGestor}
                        >
                          <option value="">Responsable...</option>
                          {miembros.filter(m => m.rol === 'COLABORADOR').map(m => (
                            <option key={m.usuarioId} value={m.usuarioId}>
                              {m.nombreUsuario}
                            </option>
                          ))}
                        </select>
                        <button 
                          type="submit" 
                          className="ws-btn-primary"
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                          disabled={creandoSubtarea || !esGestor}
                        >
                          + Add
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Evidencias (RF-06) */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
                      📎 Evidencias e Información Adjunta
                    </h4>
                    {tareaDetalle.evidencias && tareaDetalle.evidencias.length > 0 ? (
                      <ul style={{ paddingLeft: '20px', margin: '0 0 12px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {tareaDetalle.evidencias.map((url, idx) => (
                          <li key={idx} style={{ fontSize: '13.5px' }}>
                            <a 
                                      href={url.startsWith('http') ? url : `https://${url}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: 'var(--accent-secondary)', textDecoration: 'underline', wordBreak: 'break-all' }}
                            >
                              {url.includes('/uploads/') ? `📄 Archivo Adjunto (${url.substring(url.lastIndexOf('/') + 1)})` : url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 12px 0' }}>No hay evidencias en esta tarea.</p>
                    )}

                    {/* Subida y enlace de evidencias */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      {/* Subir archivo local */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Cargar Archivo Local</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input 
                            type="file" 
                            id="file-upload-input"
                            onChange={e => setArchivoEvidencia(e.target.files?.[0] ?? null)}
                            style={{ fontSize: '12px', maxWidth: '150px' }}
                          />
                          <button 
                            onClick={handleSubirEvidencia}
                            className="ws-btn-primary"
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                            disabled={subiendoArchivo || !archivoEvidencia}
                          >
                            {subiendoArchivo ? 'Cargando...' : 'Subir'}
                          </button>
                        </div>
                      </div>

                      {/* Registrar Enlace */}
                      <form onSubmit={handleAddEvidenciaUrl} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Agregar Enlace Web</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input 
                            type="url" 
                            placeholder="https://google.com/doc..."
                            value={nuevaEvidenciaUrl}
                            onChange={e => setNuevaEvidenciaUrl(e.target.value)}
                            className="ws-search-input"
                            style={{ fontSize: '12px', padding: '4px 8px', flex: 1 }}
                            required
                          />
                          <button 
                            type="submit" 
                            className="ws-btn-primary"
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            + Link
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Comentarios (RF-18) */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
                      💬 Comentarios
                    </h4>
                    {cargandoComentarios ? (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cargando comentarios...</div>
                    ) : comentarios.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 12px 0' }}>No hay comentarios todavía. ¡Sé el primero!</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px', marginBottom: '12px' }}>
                        {comentarios.map(c => (
                          <div key={c.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{c.usuarioNombre || `Usuario #${c.usuarioId}`}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(c.fechaCreacion).toLocaleString()}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{c.contenido}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Enviar Comentario Form */}
                    <form onSubmit={handleAddComentario} style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <input 
                        type="text"
                        placeholder="Escribe un comentario..."
                        value={nuevoComentario}
                        onChange={e => setNuevoComentario(e.target.value)}
                        className="ws-search-input"
                        style={{ flex: 1, fontSize: '13px' }}
                        required
                      />
                      <button type="submit" className="ws-btn-primary" style={{ fontSize: '13px' }}>Enviar</button>
                    </form>
                  </div>

                </div>

                {/* Columna Derecha: Metadatos, Dependencias, Bitácora Historial */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Panel de Atributos */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', padding: '14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Estado</span>
                      <span className={ESTADOS[tareaDetalle.estado] ?? 'ws-badge'} style={{ marginTop: '4px', display: 'inline-block' }}>
                        {LABEL_ESTADO[tareaDetalle.estado] ?? tareaDetalle.estado}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Prioridad</span>
                      <span 
                        className={`ws-prioridad ws-prioridad-${tareaDetalle.prioridad.toLowerCase()}`}
                        style={{ marginTop: '4px', display: 'inline-block' }}
                      >
                        {PRIORIDAD_ICONO[tareaDetalle.prioridad]} {PRIORIDAD_CONFIG[tareaDetalle.prioridad]?.label || tareaDetalle.prioridad}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Responsable Asignado</span>
                      <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 700, marginTop: '2px', display: 'block' }}>
                        {(() => {
                          const m = miembros.find(x => x.usuarioId === tareaDetalle.responsableId);
                          return m ? `${m.nombreUsuario} (${m.correoUsuario})` : (tareaDetalle.responsableId ? `ID Colaborador: ${tareaDetalle.responsableId}` : 'Sin responsable');
                        })()}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Fecha Límite</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                        {tareaDetalle.fechaLimite || 'Sin fecha límite'}
                      </span>
                    </div>
                  </div>

                  {/* Dependencias de la Tarea (RF-03 & RF-11) */}
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                      🔗 Depende de (Prerrequisitos)
                    </h4>
                    {tareaDetalle.dependencias && tareaDetalle.dependencias.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {tareaDetalle.dependencias.map(depId => {
                          const depTask = tareas.find(x => x.id === depId);
                          const estaCompletada = depTask?.estado === 'COMPLETADA' || depTask?.estado === 'CANCELADA';
                          return (
                            <span 
                              key={depId} 
                              style={{
                                fontSize: '12px', 
                                backgroundColor: estaCompletada ? 'rgba(255, 255, 255, 0.04)' : 'rgba(239, 68, 68, 0.12)', 
                                color: estaCompletada ? 'var(--text-secondary)' : '#f87171',
                                padding: '4px 10px', borderRadius: '6px', fontWeight: 550,
                                border: estaCompletada ? '1px solid var(--border)' : '1px solid rgba(239, 68, 68, 0.2)'
                              }}
                              title={estaCompletada ? 'Dependencia resuelta' : 'Dependencia pendiente (BLOQUEANTE)'}
                            >
                              {estaCompletada ? '✅' : '🔒'} {depTask ? depTask.titulo : `Tarea #${depId}`}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Esta tarea no depende de ninguna otra.</span>
                    )}
                  </div>

                  {/* Historial de Auditoría / Cambios de Estado (RF-05) */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⏳</span> Historial de Estados
                    </h4>
                    
                    {cargandoHistorial ? (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cargando bitácora...</div>
                    ) : historial.length === 0 ? (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin cambios registrados.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '8px', borderLeft: '2px solid var(--border)', maxHeight: '200px', overflowY: 'auto' }}>
                        {historial.map((h: any) => (
                          <div key={h.id} style={{ position: 'relative', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            <div style={{
                              position: 'absolute', left: '-13px', top: '4px', width: '8px', height: '8px',
                              borderRadius: '50%', backgroundColor: '#cbd5e1', border: '2px solid #07080c'
                            }} />
                            
                            <div>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.usuarioNombre}</span> cambió de{' '}
                              <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '1px 5px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                                {LABEL_ESTADO[h.estadoAnterior] ?? h.estadoAnterior}
                              </span>{' '}
                              a{' '}
                              <span className={ESTADOS[h.estadoNuevo] ?? 'ws-badge'} style={{ fontSize: '9px', padding: '1px 4px' }}>
                                {LABEL_ESTADO[h.estadoNuevo] ?? h.estadoNuevo}
                              </span>
                            </div>
                            
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                              &ldquo;{h.motivo}&rdquo;
                            </div>

                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
                              {h.fecha ? new Date(h.fecha).toLocaleString() : '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

              <div className="ws-modal-footer" style={{ borderTop: '1px solid var(--border)', marginTop: '20px', paddingTop: '12px' }}>
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

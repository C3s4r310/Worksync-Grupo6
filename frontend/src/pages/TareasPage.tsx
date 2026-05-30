import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Tarea, TareaRequest } from '../types/tarea';
import { PRIORIDAD_CONFIG } from '../types/tarea';
import { listarTareasPorProyecto, crearTarea, actualizarTarea, eliminarTarea } from '../services/tareaService';
import AppLayout from '../components/AppLayout';
import TareaForm from '../components/tareas/TareaForm';

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
  const { proyectoId } = useParams<{ proyectoId: string }>();
  const idProyecto = Number(proyectoId ?? 1);

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [tareaEditar, setTareaEditar] = useState<Tarea | null>(null);

  useEffect(() => { cargar(); }, [idProyecto]);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await listarTareasPorProyecto(idProyecto);
      setTareas(data);
    } catch {
      setError('No se pudieron cargar las tareas.');
    } finally {
      setCargando(false);
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

  const guardar = async (datos: TareaRequest) => {
    try {
      if (tareaEditar) {
        const actualizada = await actualizarTarea(tareaEditar.id, datos);
        setTareas(prev => prev.map(t => t.id === tareaEditar.id ? actualizada : t));
      } else {
        const nueva = await crearTarea(datos);
        setTareas(prev => [...prev, nueva]);
      }
      cerrar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar.');
    }
  };

  const eliminar = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await eliminarTarea(id);
      setTareas(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Error al eliminar la tarea.');
    }
  };

  return (
    <AppLayout>
      <div className="ws-page-header">
        <div>
          <h1 className="ws-page-title">Tareas del Proyecto #{idProyecto}</h1>
          <p className="ws-page-subtitle">Gestiona las tareas del equipo</p>
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
          <option value="">Todos los responsables</option>
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
                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.titulo}</td>
                    <td style={{ color: '#64748b' }}>{t.responsableId ?? '—'}</td>
                    <td>
                      <span className={ESTADOS[t.estado] ?? 'ws-badge'}>
                        {LABEL_ESTADO[t.estado] ?? t.estado}
                      </span>
                    </td>
                    <td>
                      <span className={priClass}>
                        {PRIORIDAD_ICONO[t.prioridad]} {pri.label}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>{t.fechaLimite ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
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

      {/* Modal form */}
      {modalAbierto && (
        <TareaForm
          proyectoId={idProyecto}
          tareaEditar={tareaEditar}
          onGuardar={guardar}
          onCancelar={cerrar}
        />
      )}
    </AppLayout>
  );
}
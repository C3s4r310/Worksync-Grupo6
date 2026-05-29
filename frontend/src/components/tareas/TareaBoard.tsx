import { useEffect, useState } from 'react';
import type { Tarea, TareaRequest, FiltrosTarea } from '../../types/tarea';
import {
  listarTareasPorProyecto,
  crearTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstadoTarea,
  buscarTareas,
} from '../../services/tareaService';
import TareaCard from './TareaCard';
import TareaForm from './TareaForm';

interface TareaBoardProps {
  proyectoId: number;
  nombreProyecto: string;
  filtros?: FiltrosTarea; // Recibe los filtros desde el padre
}

// Columnas del tablero Kanban
const COLUMNAS = [
  { estado: 'PENDIENTE',    label: 'Por hacer' },
  { estado: 'EN_PROGRESO',  label: 'En progreso' },
  { estado: 'EN_REVISION',  label: 'En revisión' },
  { estado: 'COMPLETADA',   label: 'Completado' },
];

export default function TareaBoard({ proyectoId, nombreProyecto, filtros }: TareaBoardProps) {
  const [tareas, setTareas]           = useState<Tarea[]>([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tareaEditar, setTareaEditar] = useState<Tarea | null>(null);

  // Carga las tareas cuando cambia el proyecto o cuando cambian los filtros
  useEffect(() => {
    cargarTareas();
  }, [proyectoId, filtros]);

  const cargarTareas = async () => {
    try {
      setCargando(true);
      
      // Verificamos si el usuario aplicó algún filtro
      const hayFiltros = filtros && Object.values(filtros).some(val => val !== '' && val !== undefined);

      if (hayFiltros) {
        // RF-24: Usamos nuestro motor de búsqueda
        const dataPage = await buscarTareas(proyectoId, filtros);
        setTareas(dataPage.content); // Spring Boot devuelve los datos dentro de 'content'
      } else {
        // Lógica original: Trae todo sin filtros
        const data = await listarTareasPorProyecto(proyectoId);
        setTareas(data);
      }
    } catch {
      setError('No se pudieron cargar las tareas.');
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async (datos: TareaRequest) => {
    try {
      if (tareaEditar) {
        const actualizada = await actualizarTarea(tareaEditar.id, datos);
        setTareas(prev => prev.map(t => t.id === actualizada.id ? actualizada : t));
      } else {
        const nueva = await crearTarea(datos);
        setTareas(prev => [...prev, nueva]);
      }
      cerrarForm();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar la tarea.');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await eliminarTarea(id);
      setTareas(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Error al eliminar la tarea.');
    }
  };

  const handleEditar = (tarea: Tarea) => {
    setTareaEditar(tarea);
    setMostrarForm(true);
  };

  // Drag & drop entre columnas para cambiar estado (Original)
  const handleDragStart = (e: React.DragEvent, tareaId: number) => {
    e.dataTransfer.setData('tareaId', String(tareaId));
  };

  const handleDrop = async (e: React.DragEvent, nuevoEstado: string) => {
    e.preventDefault();
    const tareaId = Number(e.dataTransfer.getData('tareaId'));
    const tarea = tareas.find(t => t.id === tareaId);
    if (!tarea || tarea.estado === nuevoEstado) return;

    try {
      const actualizada = await cambiarEstadoTarea(tareaId, nuevoEstado);
      setTareas(prev => prev.map(t => t.id === tareaId ? actualizada : t));
    } catch {
      setError('Error al cambiar el estado.');
    }
  };

  const cerrarForm = () => {
    setMostrarForm(false);
    setTareaEditar(null);
  };

  const tareasPorEstado = (estado: string) =>
    tareas.filter(t => t.estado === estado);

  return (
    <div className="board-container">
      {/* Encabezado */}
      <div className="board-header">
        <div>
          <h1 className="board-titulo">Tablero</h1>
          <p className="board-subtitulo">{nombreProyecto}</p>
        </div>
        <button className="btn-nueva-tarea" onClick={() => setMostrarForm(true)}>
          + Nueva tarea
        </button>
      </div>

      {error && (
        <div className="board-error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {cargando ? (
        <div className="board-cargando">Cargando tareas...</div>
      ) : (
        <div className="board-columnas">
          {COLUMNAS.map(col => (
            <div
              key={col.estado}
              className="columna"
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, col.estado)}
            >
              {/* Encabezado de columna */}
              <div className={`columna-header columna-header-${col.estado.toLowerCase()}`}>
                <span className="columna-label">{col.label}</span>
                <span className="columna-count">{tareasPorEstado(col.estado).length}</span>
              </div>

              {/* Tarjetas de tareas */}
              <div className="columna-tarjetas">
                {tareasPorEstado(col.estado).map(tarea => (
                  <div
                    key={tarea.id}
                    draggable
                    onDragStart={e => handleDragStart(e, tarea.id)}
                  >
                    <TareaCard
                      tarea={tarea}
                      onEditar={handleEditar}
                      onEliminar={handleEliminar}
                    />
                  </div>
                ))}

                {tareasPorEstado(col.estado).length === 0 && (
                  <p className="columna-vacia">Sin tareas</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {mostrarForm && (
        <TareaForm
          proyectoId={proyectoId}
          tareaEditar={tareaEditar}
          onGuardar={handleGuardar}
          onCancelar={cerrarForm}
        />
      )}
    </div>
  );
}
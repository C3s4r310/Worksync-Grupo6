"use client";

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
  filtros?: FiltrosTarea;
  onVerDetalle: (tarea: Tarea) => void;
  esGestor?: boolean;
}

// Columnas del tablero Kanban
const COLUMNAS = [
  { estado: 'PENDIENTE',    label: 'Por hacer' },
  { estado: 'EN_PROGRESO',  label: 'En progreso' },
  { estado: 'EN_REVISION',  label: 'En revisión' },
  { estado: 'COMPLETADA',   label: 'Completado' },
];

export default function TareaBoard({ proyectoId, nombreProyecto, filtros, onVerDetalle, esGestor = true }: TareaBoardProps) {
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
      setError('');
      
      const hayFiltros = filtros && Object.values(filtros).some(val => val !== '' && val !== undefined);

      if (hayFiltros) {
        const dataPage = await buscarTareas(proyectoId, filtros);
        setTareas(dataPage.content);
      } else {
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

    // RF-05: Solicitar motivo del cambio de estado al usuario
    const motivo = prompt(`Ingresa el motivo para cambiar el estado a "${nuevoEstado}":`, "Cambio rápido en el tablero");
    if (motivo === null) return; // Cancelar cambio si se presiona cancelar en el prompt

    try {
      setError('');
      const actualizada = await cambiarEstadoTarea(tareaId, nuevoEstado, motivo);
      setTareas(prev => prev.map(t => t.id === tareaId ? actualizada : t));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado.');
    }
  };

  const cerrarForm = () => {
    setMostrarForm(false);
    setTareaEditar(null);
  };

  const tareasPorEstado = (estado: string) =>
    tareas.filter(t => t.estado === estado);

  // Calcular las dependencias para detectar cuellos de botella
  const dependenciasSet = new Set<number>();
  tareas.forEach(t => {
    if (t.dependencias && t.dependencias.length > 0) {
      t.dependencias.forEach(depId => dependenciasSet.add(depId));
    }
  });

  return (
    <div className="board-container" style={{ padding: '12px 0' }}>
      {/* Encabezado */}
      <div className="board-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="board-titulo" style={{ fontSize: '20px' }}>Tablero Kanban</h1>
          <p className="board-subtitulo">{nombreProyecto}</p>
        </div>
        <button 
          className="btn-nueva-tarea" 
          onClick={() => setMostrarForm(true)}
          disabled={!esGestor}
          style={{ opacity: esGestor ? 1 : 0.5, cursor: esGestor ? 'pointer' : 'not-allowed' }}
          title={!esGestor ? "Solo Administradores y Líderes pueden crear tareas" : undefined}
        >
          + Nueva tarea
        </button>
      </div>

      {error && (
        <div className="board-error" style={{ marginBottom: '16px' }}>
          <span>{error}</span>
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
              style={{ minHeight: '400px' }}
            >
              {/* Encabezado de columna */}
              <div className={`columna-header columna-header-${col.estado.toLowerCase()}`}>
                <span className="columna-label">{col.label}</span>
                <span className="columna-count">{tareasPorEstado(col.estado).length}</span>
              </div>

              {/* Tarjetas de tareas */}
              <div className="columna-tarjetas">
                {tareasPorEstado(col.estado).map(tarea => {
                  const isBottleneck = dependenciasSet.has(tarea.id) && tarea.estado !== 'COMPLETADA' && tarea.estado !== 'CANCELADA';
                  return (
                    <div
                      key={tarea.id}
                      draggable
                      onDragStart={e => handleDragStart(e, tarea.id)}
                    >
                      <TareaCard
                        tarea={tarea}
                        onEditar={handleEditar}
                        onEliminar={handleEliminar}
                        onVerDetalle={onVerDetalle}
                        isBottleneck={isBottleneck}
                        esGestor={esGestor}
                      />
                    </div>
                  );
                })}

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

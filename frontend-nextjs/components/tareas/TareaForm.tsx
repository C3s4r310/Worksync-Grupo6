"use client";

import { useState, useEffect } from 'react';
import type { Tarea, TareaRequest, Prioridad } from '../../types/tarea';
import { loadAuth } from '../../utils/storage';

interface TareaFormProps {
  proyectoId: number;
  tareaEditar?: Tarea | null;
  onGuardar: (datos: TareaRequest) => Promise<void>;
  onCancelar: () => void;
}

const PRIORIDADES: Prioridad[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

const getAuthHeader = (): HeadersInit => {
  const auth = loadAuth();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth?.token ?? ''}`,
  };
};

export default function TareaForm({ proyectoId, tareaEditar, onGuardar, onCancelar }: TareaFormProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('MEDIA');
  const [fechaLimite, setFechaLimite] = useState('');
  const [evidencias, setEvidencias] = useState('');
  const [responsableId, setResponsableId] = useState<number | ''>('');
  const [dependencias, setDependencias] = useState<number[]>([]);
  
  // Catálogos cargados de la API
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [tareasProyecto, setTareasProyecto] = useState<Tarea[]>([]);
  const [error, setError] = useState('');

  // 1. Cargar colaboradores del proyecto y tareas existentes para dependencias
  useEffect(() => {
    async function cargarCatalogos() {
      try {
        // Cargar miembros del proyecto
        const resMiembros = await fetch(`http://localhost:8080/api/proyectos/${proyectoId}/miembros`, {
          headers: getAuthHeader()
        });
        if (resMiembros.ok) {
          const miembros = await resMiembros.json();
          // RF-04: Solo se pueden asignar tareas a miembros con rol COLABORADOR
          const colabs = miembros.filter((m: any) => m.rol === 'COLABORADOR');
          setColaboradores(colabs);
        }

        // Cargar otras tareas del proyecto
        const resTareas = await fetch(`http://localhost:8080/api/tareas/proyecto/${proyectoId}`, {
          headers: getAuthHeader()
        });
        if (resTareas.ok) {
          const list = await resTareas.json();
          setTareasProyecto(list || []);
        }
      } catch (err) {
        console.error('Error al cargar catálogos del formulario de tareas:', err);
      }
    }

    if (proyectoId) {
      cargarCatalogos();
    }
  }, [proyectoId]);

  // Si viene una tarea para editar, prellenar el formulario
  useEffect(() => {
    if (tareaEditar) {
      setTitulo(tareaEditar.titulo);
      setDescripcion(tareaEditar.descripcion ?? '');
      setPrioridad(tareaEditar.prioridad);
      setFechaLimite(tareaEditar.fechaLimite ?? '');
      setEvidencias(tareaEditar.evidencias ? tareaEditar.evidencias.join(', ') : '');
      setResponsableId(tareaEditar.responsableId ?? '');
      setDependencias(tareaEditar.dependencias ?? []);
    }
  }, [tareaEditar]);

  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    setError('');
    setGuardando(true);

    const datos: TareaRequest = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      prioridad,
      proyectoId,
      fechaLimite: fechaLimite || undefined,
      responsableId: responsableId ? Number(responsableId) : undefined,
      dependencias,
      evidencias: evidencias
        ? evidencias.split(',').map(e => e.trim()).filter(Boolean)
        : [],
    };

    try {
      await onGuardar(datos);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar la tarea.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
        <h2 className="modal-titulo">{tareaEditar ? 'Editar tarea' : 'Nueva tarea'}</h2>

        {error && <p className="form-error">⚠️ {error}</p>}

        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div className="ws-field" style={{ margin: 0 }}>
            <label className="form-label">Título *</label>
            <input
              className="form-input"
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Nombre de la tarea"
              required
            />
          </div>

          <div className="ws-field" style={{ margin: 0 }}>
            <label className="form-label">Descripción</label>
            <textarea
              className="form-input form-textarea"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Describe la tarea..."
              style={{ minHeight: '60px' }}
            />
          </div>

          {/* RF-14: Selector de prioridad */}
          <div className="ws-field" style={{ margin: 0 }}>
            <label className="form-label">Prioridad *</label>
            <div className="prioridad-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {PRIORIDADES.map(p => (
                <button
                  key={p}
                  className={`prioridad-btn prioridad-${p.toLowerCase()} ${prioridad === p ? 'selected' : ''}`}
                  onClick={() => setPrioridad(p)}
                  type="button"
                  style={{ fontSize: '12px', padding: '6px 2px' }}
                >
                  {PRIORIDAD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="ws-field" style={{ margin: 0 }}>
            <label className="form-label">Asignar Colaborador Responsable</label>
            <select
              className="form-input"
              value={responsableId}
              onChange={e => setResponsableId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Sin asignar (Pendiente)</option>
              {colaboradores.map(colab => {
                const activeTasksCount = tareasProyecto.filter(t => 
                  t.responsableId === colab.usuarioId && 
                  t.estado !== 'COMPLETADA' && 
                  t.estado !== 'CANCELADA' &&
                  (!tareaEditar || t.id !== tareaEditar.id)
                ).length;
                const isOverloaded = activeTasksCount >= 3;
                return (
                  <option 
                    key={colab.usuarioId} 
                    value={colab.usuarioId}
                    style={{ color: isOverloaded ? '#ef4444' : 'inherit' }}
                  >
                    {colab.nombreUsuario} ({activeTasksCount}/3 tareas activas){isOverloaded ? ' - [SOBRECARGADO]' : ''}
                  </option>
                );
              })}
            </select>
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Solo colaboradores del proyecto están disponibles para asignación inteligente. Límite de 3 tareas activas.
            </span>
          </div>

          {/* RF-03: Dependencias */}
          {tareasProyecto.length > 0 && (
            <div className="ws-field" style={{ margin: 0 }}>
              <label className="form-label">Dependencias (Tareas requeridas)</label>
              <div style={{
                maxHeight: '100px',
                overflowY: 'auto',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {tareasProyecto
                  .filter(t => !tareaEditar || t.id !== tareaEditar.id)
                  .map(t => (
                    <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={dependencias.includes(t.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setDependencias(prev => [...prev, t.id]);
                          } else {
                            setDependencias(prev => prev.filter(id => id !== t.id));
                          }
                        }}
                      />
                      {t.titulo}
                    </label>
                  ))}
              </div>
            </div>
          )}

          <div className="ws-field" style={{ margin: 0 }}>
            <label className="form-label">Fecha límite</label>
            <input
              className="form-input"
              type="date"
              value={fechaLimite}
              onChange={e => setFechaLimite(e.target.value)}
            />
          </div>

          <div className="ws-field" style={{ margin: 0 }}>
            <label className="form-label">Evidencias (URLs separadas por coma)</label>
            <input
              className="form-input"
              type="text"
              value={evidencias}
              onChange={e => setEvidencias(e.target.value)}
              placeholder="https://... , https://..."
            />
          </div>

        </div>

        <div className="modal-botones" style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <button className="btn-secundario" onClick={onCancelar}>Cancelar</button>
          <button className="btn-primario" onClick={handleSubmit}>
            {tareaEditar ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </div>
      </div>
    </div>
  );
}

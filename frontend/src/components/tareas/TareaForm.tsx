import { useState, useEffect } from 'react';
import type { Tarea, TareaRequest, Prioridad } from '../../types/tarea';

interface TareaFormProps {
  proyectoId: number;
  tareaEditar?: Tarea | null;
  onGuardar: (datos: TareaRequest) => void;
  onCancelar: () => void;
}

const PRIORIDADES: Prioridad[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

export default function TareaForm({ proyectoId, tareaEditar, onGuardar, onCancelar }: TareaFormProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('MEDIA');
  const [fechaLimite, setFechaLimite] = useState('');
  const [evidencias, setEvidencias] = useState('');
  const [error, setError] = useState('');

  // Si viene una tarea para editar, prellenar el formulario
  useEffect(() => {
    if (tareaEditar) {
      setTitulo(tareaEditar.titulo);
      setDescripcion(tareaEditar.descripcion ?? '');
      setPrioridad(tareaEditar.prioridad);
      setFechaLimite(tareaEditar.fechaLimite ?? '');
      setEvidencias(tareaEditar.evidencias.join(', '));
    }
  }, [tareaEditar]);

  const handleSubmit = () => {
    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    setError('');

    const datos: TareaRequest = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      prioridad,
      proyectoId,
      fechaLimite: fechaLimite || undefined,
      evidencias: evidencias
        ? evidencias.split(',').map(e => e.trim()).filter(Boolean)
        : [],
    };

    onGuardar(datos);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-titulo">{tareaEditar ? 'Editar tarea' : 'Nueva tarea'}</h2>

        {error && <p className="form-error">{error}</p>}

        <label className="form-label">Título *</label>
        <input
          className="form-input"
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Nombre de la tarea"
        />

        <label className="form-label">Descripción</label>
        <textarea
          className="form-input form-textarea"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Describe la tarea..."
        />

        {/* RF-14: Selector de prioridad */}
        <label className="form-label">Prioridad *</label>
        <div className="prioridad-selector">
          {PRIORIDADES.map(p => (
            <button
              key={p}
              className={`prioridad-btn prioridad-${p.toLowerCase()} ${prioridad === p ? 'selected' : ''}`}
              onClick={() => setPrioridad(p)}
              type="button"
            >
              {PRIORIDAD_LABELS[p]}
            </button>
          ))}
        </div>

        <label className="form-label">Fecha límite</label>
        <input
          className="form-input"
          type="date"
          value={fechaLimite}
          onChange={e => setFechaLimite(e.target.value)}
        />

        <label className="form-label">Evidencias (URLs separadas por coma)</label>
        <input
          className="form-input"
          type="text"
          value={evidencias}
          onChange={e => setEvidencias(e.target.value)}
          placeholder="https://... , https://..."
        />

        <div className="modal-botones">
          <button className="btn-secundario" onClick={onCancelar}>Cancelar</button>
          <button className="btn-primario" onClick={handleSubmit}>
            {tareaEditar ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </div>
      </div>
    </div>
  );
}
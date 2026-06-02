"use client";

import type { Tarea } from '../../types/tarea';
import { PRIORIDAD_CONFIG } from '../../types/tarea';

interface TareaCardProps {
  tarea: Tarea;
  onEditar: (tarea: Tarea) => void;
  onEliminar: (id: number) => void;
}

export default function TareaCard({ tarea, onEditar, onEliminar }: TareaCardProps) {
  const prioridad = PRIORIDAD_CONFIG[tarea.prioridad];

  return (
    <div className="tarea-card">
      <p className="tarea-titulo">{tarea.titulo}</p>

      {/* RF-14: Badge de prioridad con color según nivel */}
      <span
        className="tarea-prioridad"
        style={{ backgroundColor: prioridad.bg, color: prioridad.color }}
      >
        {prioridad.label}
      </span>

      <p className="tarea-descripcion">{tarea.descripcion}</p>

      <div className="tarea-footer">
        <span className="tarea-fecha">
          {tarea.fechaLimite ? `📅 ${tarea.fechaLimite}` : 'Sin fecha'}
        </span>
        <div className="tarea-acciones">
          <button className="btn-editar" onClick={() => onEditar(tarea)} title="Editar">✏️</button>
          <button className="btn-eliminar" onClick={() => onEliminar(tarea.id)} title="Eliminar">🗑️</button>
        </div>
      </div>

      {tarea.dependencias && tarea.dependencias.length > 0 && (
        <div className="tarea-deps">
          🔗 {tarea.dependencias.length} dependencia{tarea.dependencias.length > 1 ? 's' : ''}
        </div>
      )}
      {tarea.evidencias && tarea.evidencias.length > 0 && (
        <div className="tarea-evidencias">
          📎 {tarea.evidencias.length} evidencia{tarea.evidencias.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

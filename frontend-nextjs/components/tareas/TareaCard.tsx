"use client";

import type { Tarea } from '../../types/tarea';
import { PRIORIDAD_CONFIG } from '../../types/tarea';

interface TareaCardProps {
  tarea: Tarea;
  onEditar: (tarea: Tarea) => void;
  onEliminar: (id: number) => void;
  onVerDetalle: (tarea: Tarea) => void;
  isBottleneck?: boolean;
  esGestor?: boolean;
}

export default function TareaCard({ tarea, onEditar, onEliminar, onVerDetalle, isBottleneck, esGestor = true }: TareaCardProps) {
  const prioridad = PRIORIDAD_CONFIG[tarea.prioridad];

  return (
    <div className="tarea-card" onClick={() => onVerDetalle(tarea)} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
        <p className="tarea-titulo" style={{ margin: 0, fontWeight: 600 }}>{tarea.titulo}</p>
        {isBottleneck && (
          <span 
            style={{ 
              backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '10.5px', 
              padding: '2px 6px', fontWeight: 'bold', borderRadius: '4px', 
              border: '1px solid #fca5a5', whiteSpace: 'nowrap'
            }} 
            title="Esta tarea bloquea a otras tareas (Cuello de Botella)"
          >
            ⚠️ Cuello Botella
          </span>
        )}
      </div>

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
        <div className="tarea-acciones" onClick={e => e.stopPropagation()}>
          <button 
            className="btn-editar" 
            onClick={() => onEditar(tarea)} 
            title="Editar"
            disabled={!esGestor}
            style={{ opacity: esGestor ? 1 : 0.4, cursor: esGestor ? 'pointer' : 'not-allowed' }}
          >
            ✏️
          </button>
          <button 
            className="btn-eliminar" 
            onClick={() => onEliminar(tarea.id)} 
            title="Eliminar"
            disabled={!esGestor}
            style={{ opacity: esGestor ? 1 : 0.4, cursor: esGestor ? 'pointer' : 'not-allowed' }}
          >
            🗑️
          </button>
        </div>
      </div>

      {tarea.dependencias && tarea.dependencias.length > 0 && (
        <div className="tarea-deps" style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
          🔗 {tarea.dependencias.length} dependencia{tarea.dependencias.length > 1 ? 's' : ''}
        </div>
      )}
      {tarea.evidencias && tarea.evidencias.length > 0 && (
        <div className="tarea-evidencias" style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
          📎 {tarea.evidencias.length} evidencia{tarea.evidencias.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

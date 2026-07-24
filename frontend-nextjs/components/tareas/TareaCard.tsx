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

const PRIORIDAD_ESTILO: Record<string, { color: string; bg: string; border: string }> = {
  BAJA:    { color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.2)' },
  MEDIA:   { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.2)' },
  ALTA:    { color: '#fb7185', bg: 'rgba(251, 113, 133, 0.12)', border: 'rgba(251, 113, 133, 0.2)' },
  CRITICA: { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.12)', border: 'rgba(192, 132, 252, 0.2)' },
};

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

export default function TareaCard({ tarea, onEditar, onEliminar, onVerDetalle, isBottleneck, esGestor = true }: TareaCardProps) {
  const prioridad = PRIORIDAD_CONFIG[tarea.prioridad];
  const est = PRIORIDAD_ESTILO[tarea.prioridad] || PRIORIDAD_ESTILO.BAJA;

  return (
    <div className="tarea-card" onClick={() => onVerDetalle(tarea)} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
        <p className="tarea-titulo" style={{ margin: 0, fontWeight: 600 }}>{tarea.titulo}</p>
        {isBottleneck && (
          <span 
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '10.5px', 
              padding: '2px 8px', fontWeight: 'bold', borderRadius: '4px', 
              border: '1px solid rgba(239, 68, 68, 0.25)', whiteSpace: 'nowrap'
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
        style={{ backgroundColor: est.bg, color: est.color, borderColor: est.border, border: '1px solid' }}
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
            style={{ opacity: esGestor ? 1 : 0.4, cursor: esGestor ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <EditIcon />
          </button>
          <button 
            className="btn-eliminar" 
            onClick={() => onEliminar(tarea.id)} 
            title="Eliminar"
            disabled={!esGestor}
            style={{ opacity: esGestor ? 1 : 0.4, cursor: esGestor ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <TrashIcon />
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

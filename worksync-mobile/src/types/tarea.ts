export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: Prioridad;
  responsableId: number | null;
  proyectoId: number;
  fechaLimite: string;
  fechaCreacion: string;
  dependencias: number[];
  evidencias: string[];
  tareaPadreId?: number | null;
}

export interface TareaRequest {
  titulo: string;
  descripcion?: string;
  prioridad: Prioridad;
  responsableId?: number;
  proyectoId: number;
  fechaLimite?: string;
  dependencias?: number[];
  evidencias?: string[];
  tareaPadreId?: number | null;
}

export interface Comentario {
  id: number;
  tareaId: number;
  usuarioId: number;
  usuarioNombre: string;
  contenido: string;
  fechaCreacion: string;
}

export const PRIORIDAD_CONFIG: Record<Prioridad, { label: string; color: string; bg: string }> = {
  BAJA:    { label: 'Baja',    color: '#4caf50', bg: '#e8f5e9' },
  MEDIA:   { label: 'Media',   color: '#ff9800', bg: '#fff3e0' },
  ALTA:    { label: 'Alta',    color: '#f44336', bg: '#ffebee' },
  CRITICA: { label: 'Crítica', color: '#7b1fa2', bg: '#f3e5f5' },
};

// --- LO NUEVO PARA TUS FILTROS (RF-24) ---

// Interfaz para la respuesta paginada de Spring Boot
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Interfaz para agrupar los datos que el usuario escriba en el buscador
export interface FiltrosTarea {
  estado?: string;
  prioridad?: string;
  responsable?: string;
  fechaLimite?: string;
  palabraClave?: string;
  page?: number;
  size?: number;
}

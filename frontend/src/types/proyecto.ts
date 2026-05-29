// Interfaz principal que refleja tu proyectoDTO de Java
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

// Interfaz para cuando el usuario quiera crear o editar un proyecto
export interface ProyectoRequest {
  nombre: string;
  descripcion: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

// --- LO NUEVO PARA TUS FILTROS (RF-24) ---
// Interfaz para agrupar los datos que el usuario escriba en el buscador de proyectos
export interface FiltrosProyecto {
  estado?: string;
  fechaInicio?: string;
  palabraClave?: string;
  page?: number;
  size?: number;
}
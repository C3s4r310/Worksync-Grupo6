export interface Mensaje {
  id: number;
  emisorId: number;
  receptorId: number;
  proyectoId?: number;
  contenido: string;
  fechaEnvio: string;
  leido: boolean;
}

export interface MiembroChat {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  ultimaConexion?: string;
}

export interface ProyectoMiembrosChat {
  id: number;
  nombre: string;
  miembros: MiembroChat[];
}

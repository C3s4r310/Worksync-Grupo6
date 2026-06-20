import type { Tarea } from './tarea';

export interface ActividadReciente {
  id: number;
  tareaId: number;
  tareaTitulo: string;
  usuarioId: number;
  usuarioNombre: string;
  estadoAnterior: string;
  estadoNuevo: string;
  motivo: string;
  fecha: string;
}

export interface DashboardData {
  proyectosActivos: number;
  misTareasPendientes: number;
  vencenPronto: number;
  tareasCriticas: Tarea[];
  actividadReciente: ActividadReciente[];
}

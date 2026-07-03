export interface DistribucionTareas {
  estado: string;
  cantidad: number;
}

export interface ProgresoProyecto {
  proyectoId: number;
  proyectoNombre: string;
  porcentajeCompletitud: number;
}

export interface RendimientoColaborador {
  usuarioId: number;
  usuarioNombre: string;
  resueltasATiempo: number;
  retrasadas: number;
}

export interface ReporteDashboardData {
  distribucionTareas: DistribucionTareas[];
  progresoProyectos: ProgresoProyecto[];
  rendimientoColaboradores: RendimientoColaborador[];
}

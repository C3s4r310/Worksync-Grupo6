import type { ReporteDashboardData, DistribucionTareas, ProgresoProyecto, RendimientoColaborador } from '../types/reporte';
import { db } from '../utils/localDb';

export const obtenerReportes = async (): Promise<ReporteDashboardData> => {
  await new Promise(resolve => setTimeout(resolve, 250));

  const allProjects = db.proyectos.getAll();
  const allTasks = db.tareas.getAll();
  const allUsers = db.usuarios.getAll();

  // 1. Distribución de Tareas por Estado
  const estados = ['PENDIENTE', 'EN_PROGRESO', 'EN_REVISION', 'COMPLETADA'];
  const distribucionTareas: DistribucionTareas[] = estados.map(e => ({
    estado: e,
    cantidad: allTasks.filter(t => t.estado === e).length
  }));

  // 2. Progreso de Proyectos
  const progresoProyectos: ProgresoProyecto[] = allProjects.map(p => {
    const projTasks = allTasks.filter(t => t.proyectoId === p.id);
    const total = projTasks.length;
    const completed = projTasks.filter(t => t.estado === 'COMPLETADA').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      proyectoId: p.id,
      proyectoNombre: p.nombre,
      porcentajeCompletitud: percentage
    };
  });

  // 3. Rendimiento de Colaboradores
  const rendimientoColaboradores: RendimientoColaborador[] = allUsers.map(u => {
    const userTasks = allTasks.filter(t => t.responsableId === u.id);
    const resueltasATiempo = userTasks.filter(t => t.estado === 'COMPLETADA').length;
    
    // Simular retrasadas: si la fecha límite ya pasó y no está completada
    const ahoraStr = new Date().toISOString().split('T')[0];
    const retrasadas = userTasks.filter(t => 
      t.estado !== 'COMPLETADA' && t.fechaLimite && t.fechaLimite < ahoraStr
    ).length;

    return {
      usuarioId: u.id,
      usuarioNombre: u.nombre,
      resueltasATiempo,
      retrasadas
    };
  });

  return {
    distribucionTareas,
    progresoProyectos,
    rendimientoColaboradores
  };
};

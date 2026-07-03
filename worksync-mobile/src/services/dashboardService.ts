import type { DashboardData, ActividadReciente } from '../types/dashboard';
import type { Tarea } from '../types/tarea';
import { loadAuth } from '../utils/storage';
import { db } from '../utils/localDb';

export const obtenerDashboard = async (): Promise<DashboardData> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const auth = loadAuth();
  const currentUserId = auth?.user?.id;

  const projs = db.proyectos.getAll().filter(p => p.estado === 'ACTIVO');
  const allTasks = db.tareas.getAll();
  const allHistory = db.historial.getByTarea(0); // Para historial global, cargamos todo de ws_db_historial
  
  // Como db.historial.getByTarea(0) retorna solo de la tarea 0, carguemos directamente del localStorage para tener todo
  const rawHistString = localStorage.getItem('ws_db_historial');
  const rawHist: any[] = rawHistString ? JSON.parse(rawHistString) : [];

  // Calcular mis tareas pendientes
  const misTareasPendientes = currentUserId 
    ? allTasks.filter(t => t.responsableId === currentUserId && t.estado !== 'COMPLETADA').length 
    : 0;

  // Calcular tareas que vencen pronto (dentro de los próximos 7 días)
  const ahora = Date.now();
  const unaSemana = 1000 * 60 * 60 * 24 * 7;
  const vencenPronto = allTasks.filter(t => {
    if (t.estado === 'COMPLETADA' || !t.fechaLimite) return false;
    const diff = new Date(t.fechaLimite).getTime() - ahora;
    return diff > 0 && diff <= unaSemana;
  }).length;

  // Tareas críticas
  const tareasCriticas = allTasks
    .filter(t => t.estado !== 'COMPLETADA' && (t.prioridad === 'CRITICA' || t.prioridad === 'ALTA'))
    .slice(0, 5) as unknown as Tarea[];

  // Actividad reciente (Unir logs con el título de las tareas correspondientes)
  const actividadReciente: ActividadReciente[] = rawHist
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 8)
    .map((log: any) => {
      const task = allTasks.find(t => t.id === log.tareaId);
      return {
        id: log.id,
        tareaId: log.tareaId,
        tareaTitulo: task?.titulo || `Tarea #${log.tareaId}`,
        usuarioId: log.usuarioId,
        usuarioNombre: log.usuarioNombre,
        estadoAnterior: log.estadoAnterior,
        estadoNuevo: log.estadoNuevo,
        motivo: log.motivo,
        fecha: log.fecha
      };
    });

  return {
    proyectosActivos: projs.length,
    misTareasPendientes,
    vencenPronto,
    tareasCriticas,
    actividadReciente
  };
};

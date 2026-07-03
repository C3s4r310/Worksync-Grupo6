import type { Notificacion } from '../types/notificacion';
import { loadAuth } from '../utils/storage';

const getLocalNotifications = (): Notificacion[] => {
  const data = localStorage.getItem('ws_db_notificaciones');
  if (data) return JSON.parse(data);

  // Inicializar notificaciones semilla
  const auth = loadAuth();
  const userId = auth?.user?.id || 1;
  const seed: Notificacion[] = [
    {
      id: 1,
      usuarioId: userId,
      mensaje: 'Has sido asignado al Proyecto Worksync Móvil.',
      leida: false,
      fecha: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 2,
      usuarioId: userId,
      mensaje: 'Nueva tarea crítica pendiente: "Integrar almacenamiento local offline".',
      leida: false,
      fecha: new Date(Date.now() - 3600000).toISOString()
    }
  ];
  localStorage.setItem('ws_db_notificaciones', JSON.stringify(seed));
  return seed;
};

const saveLocalNotifications = (list: Notificacion[]) => {
  localStorage.setItem('ws_db_notificaciones', JSON.stringify(list));
};

export const listarNotificaciones = async (): Promise<Notificacion[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const auth = loadAuth();
  const currentUserId = auth?.user?.id;
  if (!currentUserId) return [];

  return getLocalNotifications().filter(n => n.usuarioId === currentUserId);
};

export const marcarComoLeida = async (id: number): Promise<Notificacion> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const list = getLocalNotifications();
  const idx = list.findIndex(n => n.id === id);
  if (idx === -1) {
    throw new Error('Notificación no encontrada');
  }

  list[idx].leida = true;
  saveLocalNotifications(list);
  return list[idx];
};

export const dispararAlertasManualmente = async (): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const auth = loadAuth();
  const userId = auth?.user?.id || 1;

  const list = getLocalNotifications();
  const nextId = list.length > 0 ? Math.max(...list.map(n => n.id)) + 1 : 1;
  
  const alertNotif: Notificacion = {
    id: nextId,
    usuarioId: userId,
    mensaje: `Alerta disparada manual: Tienes tareas pendientes por completar.`,
    leida: false,
    fecha: new Date().toISOString()
  };

  list.push(alertNotif);
  saveLocalNotifications(list);

  return 'Alertas procesadas de manera local.';
};

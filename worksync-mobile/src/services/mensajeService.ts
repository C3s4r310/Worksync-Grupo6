import { loadAuth } from '../utils/storage';
import { db } from '../utils/localDb';
import type { Mensaje, ProyectoMiembrosChat, MiembroChat } from '../types/mensaje';

export const obtenerContactos = async (): Promise<ProyectoMiembrosChat[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const auth = loadAuth();
  const currentUserId = auth?.user?.id;
  if (!currentUserId) return [];

  // Obtener proyectos donde el usuario actual es miembro activo
  const userMemberships = db.miembros.getAll().filter(m => m.usuarioId === currentUserId && m.activo);
  const userProjIds = userMemberships.map(m => m.proyectoId);

  const result: ProyectoMiembrosChat[] = [];

  for (const projId of userProjIds) {
    const proj = db.proyectos.getById(projId);
    if (!proj) continue;

    // Obtener todos los miembros activos de este proyecto
    const projMembers = db.miembros.getByProyecto(projId);
    const miembrosChatList: MiembroChat[] = [];

    for (const m of projMembers) {
      // No agregarse a uno mismo como contacto de chat
      if (m.usuarioId === currentUserId) continue;

      const user = db.usuarios.getById(m.usuarioId);
      if (user) {
        miembrosChatList.push({
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol,
          activo: m.activo,
          ultimaConexion: user.ultimaConexion
        });
      }
    }

    result.push({
      id: proj.id,
      nombre: proj.nombre,
      miembros: miembrosChatList
    });
  }

  return result;
};

export const obtenerHistorial = async (receptorId: number): Promise<Mensaje[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const auth = loadAuth();
  const currentUserId = auth?.user?.id;
  if (!currentUserId) return [];

  // Marcar como leídos
  db.mensajes.markAsRead(receptorId, currentUserId);

  const rawList = db.mensajes.getByConversation(currentUserId, receptorId);
  return rawList.map(m => ({
    id: m.id,
    emisorId: m.remitenteId,
    receptorId: m.destinatarioId,
    proyectoId: m.proyectoId,
    contenido: m.contenido,
    fechaEnvio: m.fechaEnvio,
    leido: m.leido
  }));
};

export const enviarMensaje = async (
  receptorId: number,
  contenido: string,
  proyectoId?: number
): Promise<Mensaje> => {
  await new Promise(resolve => setTimeout(resolve, 150));

  const auth = loadAuth();
  const currentUserId = auth?.user?.id;
  if (!currentUserId) {
    throw new Error('Sesión inválida');
  }

  const newMsg = db.mensajes.create({
    remitenteId: currentUserId,
    destinatarioId: receptorId,
    contenido,
    proyectoId: proyectoId || 0
  });

  return {
    id: newMsg.id,
    emisorId: newMsg.remitenteId,
    receptorId: newMsg.destinatarioId,
    proyectoId: newMsg.proyectoId,
    contenido: newMsg.contenido,
    fechaEnvio: newMsg.fechaEnvio,
    leido: newMsg.leido
  };
};

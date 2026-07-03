import type { Tarea, TareaRequest, Page, FiltrosTarea, Comentario } from '../types/tarea';
import { db } from '../utils/localDb';
import { loadAuth } from '../utils/storage';

// RF-03: Crear una tarea
export const crearTarea = async (datos: TareaRequest): Promise<Tarea> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const newT = db.tareas.create({
    titulo: datos.titulo,
    descripcion: datos.descripcion || '',
    estado: 'PENDIENTE',
    prioridad: datos.prioridad || 'MEDIA',
    responsableId: datos.responsableId || null,
    proyectoId: datos.proyectoId,
    fechaLimite: datos.fechaLimite || '',
    tareaPadreId: datos.tareaPadreId || null
  });

  return newT as unknown as Tarea;
};

// RF-03: Obtener una tarea por id
export const obtenerTarea = async (id: number): Promise<Tarea> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const t = db.tareas.getById(id);
  if (!t) {
    throw new Error('Tarea no encontrada');
  }
  return t as unknown as Tarea;
};

// RF-03: Listar tareas de un proyecto
export const listarTareasPorProyecto = async (proyectoId: number): Promise<Tarea[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const list = db.tareas.getByProyecto(proyectoId);
  return list as unknown as Tarea[];
};

// RF-03: Actualizar una tarea
export const actualizarTarea = async (id: number, datos: Partial<TareaRequest>): Promise<Tarea> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const updated = db.tareas.update(id, datos as any);
  return updated as unknown as Tarea;
};

// RF-03: Eliminación lógica de una tarea
export const eliminarTarea = async (id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  db.tareas.delete(id);
};

// RF-05: Cambiar solo el estado de una tarea con motivo
export const cambiarEstadoTarea = async (id: number, nuevoEstado: string, motivo?: string): Promise<Tarea> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const task = db.tareas.getById(id);
  if (!task) {
    throw new Error('Tarea no encontrada');
  }

  const estadoAnterior = task.estado;
  const actualizada = db.tareas.update(id, { estado: nuevoEstado });

  // Guardar log de auditoría
  const auth = loadAuth();
  const userId = auth?.user?.id || 999;
  const userName = auth?.user?.username || 'Usuario Desconocido';

  db.historial.create({
    tareaId: id,
    usuarioId: userId,
    usuarioNombre: userName,
    estadoAnterior,
    estadoNuevo: nuevoEstado,
    motivo: motivo || 'Cambio de estado rápido'
  });

  return actualizada as unknown as Tarea;
};

// RF-05: Obtener el historial de cambios de estado de una tarea
export const obtenerHistorialTarea = async (id: number): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  return db.historial.getByTarea(id);
};

// --- LO NUEVO PARA TUS FILTROS (RF-24) ---
export const buscarTareas = async (proyectoId: number | undefined, filtros: FiltrosTarea): Promise<Page<Tarea>> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  let list = db.tareas.getAll();

  if (proyectoId) {
    list = list.filter(t => t.proyectoId === proyectoId);
  }

  if (filtros.estado) {
    list = list.filter(t => t.estado === filtros.estado);
  }

  if (filtros.prioridad) {
    list = list.filter(t => t.prioridad === filtros.prioridad);
  }

  if (filtros.responsable) {
    // Si se pasa responsable, intentamos filtrar por responsableId (asumiendo que viene como ID)
    const respId = Number(filtros.responsable);
    if (!isNaN(respId)) {
      list = list.filter(t => t.responsableId === respId);
    }
  }

  if (filtros.palabraClave) {
    const query = filtros.palabraClave.toLowerCase();
    list = list.filter(t => 
      t.titulo.toLowerCase().includes(query) || 
      t.descripcion.toLowerCase().includes(query)
    );
  }

  if (filtros.fechaLimite) {
    list = list.filter(t => t.fechaLimite === filtros.fechaLimite);
  }

  const page = filtros.page || 0;
  const size = filtros.size || 10;
  const totalElements = list.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  
  const content = list.slice(page * size, (page + 1) * size) as unknown as Tarea[];

  return {
    content,
    totalElements,
    totalPages,
    size,
    number: page
  };
};

// RF-15: Listar subtareas de una tarea padre
export const listarSubtareas = async (padreId: number): Promise<Tarea[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const list = db.tareas.getSubtareas(padreId);
  return list as unknown as Tarea[];
};

// RF-18: Listar comentarios de una tarea
export const listarComentarios = async (tareaId: number): Promise<Comentario[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const list = db.comentarios.getByTarea(tareaId);
  return list as unknown as Comentario[];
};

// RF-18: Agregar un comentario a una tarea
export const agregarComentario = async (tareaId: number, contenido: string): Promise<Comentario> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const auth = loadAuth();
  const userId = auth?.user?.id || 999;
  const userName = auth?.user?.username || 'Usuario';

  const newComment = db.comentarios.create({
    tareaId,
    usuarioId: userId,
    usuarioNombre: userName,
    contenido
  });

  return newComment as unknown as Comentario;
};

// RF-06: Subir archivo de evidencia
export const subirEvidenciaArchivo = async (tareaId: number, file: File): Promise<{ url: string }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockUrl = `https://mockstorage.worksync.local/evidencias/${tareaId}_${Date.now()}_${file.name}`;
  
  const task = db.tareas.getById(tareaId);
  if (task) {
    const listEv = task.evidencias || [];
    listEv.push(mockUrl);
    db.tareas.update(tareaId, { evidencias: listEv });
  }

  return { url: mockUrl };
};

// RF-06: Registrar URL de evidencia
export const agregarEvidenciaUrl = async (tareaId: number, url: string): Promise<Tarea> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const task = db.tareas.getById(tareaId);
  if (!task) {
    throw new Error('Tarea no encontrada');
  }

  const listEv = task.evidencias || [];
  listEv.push(url);
  const actualizada = db.tareas.update(tareaId, { evidencias: listEv });

  return actualizada as unknown as Tarea;
};

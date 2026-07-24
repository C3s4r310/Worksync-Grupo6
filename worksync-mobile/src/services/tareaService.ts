import type { Tarea, TareaRequest, Page, FiltrosTarea, Comentario } from '../types/tarea';

// URL base del backend Spring Boot
import { API_BASE_URL } from './apiConfig';
const BASE_URL = `${API_BASE_URL}/tareas`;

import { loadAuth } from '../utils/storage';

// Obtiene el token JWT guardado en localStorage
const getAuthHeader = (): HeadersInit => {
  const auth = loadAuth();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth?.token ?? ''}`,
  };
};

// RF-03: Crear una tarea
export const crearTarea = async (datos: TareaRequest): Promise<Tarea> => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al crear la tarea');
  }

  return response.json();
};

// RF-03: Obtener una tarea por id
export const obtenerTarea = async (id: number): Promise<Tarea> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Tarea no encontrada');
  }

  return response.json();
};

// RF-03: Listar tareas de un proyecto
export const listarTareasPorProyecto = async (proyectoId: number): Promise<Tarea[]> => {
  const response = await fetch(`${BASE_URL}/proyecto/${proyectoId}`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener las tareas del proyecto');
  }

  return response.json();
};

// RF-03: Actualizar una tarea
export const actualizarTarea = async (id: number, datos: Partial<TareaRequest>): Promise<Tarea> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al actualizar la tarea');
  }

  return response.json();
};

// RF-03: Eliminación lógica de una tarea
export const eliminarTarea = async (id: number): Promise<void> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Error al eliminar la tarea');
  }
};

// RF-05: Cambiar solo el estado de una tarea con motivo
export const cambiarEstadoTarea = async (id: number, nuevoEstado: string, motivo?: string): Promise<Tarea> => {
  const params = new URLSearchParams({ nuevoEstado });
  if (motivo) params.append('motivo', motivo);

  const response = await fetch(`${BASE_URL}/${id}/estado?${params.toString()}`, {
    method: 'PUT',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Error al cambiar el estado de la tarea');
  }

  return response.json();
};

// RF-05: Obtener el historial de cambios de estado de una tarea
export const obtenerHistorialTarea = async (id: number): Promise<any[]> => {
  const response = await fetch(`${BASE_URL}/${id}/historial`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Error al obtener el historial de la tarea');
  }

  return response.json();
};

// --- LO NUEVO PARA TUS FILTROS (RF-24) ---
export const buscarTareas = async (proyectoId: number | undefined, filtros: FiltrosTarea): Promise<Page<Tarea>> => {
  const params = new URLSearchParams();
  
  if (proyectoId) params.append('proyectoId', proyectoId.toString());
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
  if (filtros.responsable) params.append('responsable', filtros.responsable);
  if (filtros.fechaLimite) params.append('fechaLimite', filtros.fechaLimite);
  if (filtros.palabraClave) params.append('palabraClave', filtros.palabraClave);
  
  // Paginación por defecto para RNF-01 (Rendimiento)
  params.append('page', (filtros.page || 0).toString());
  params.append('size', (filtros.size || 10).toString());

  const response = await fetch(`${BASE_URL}/buscar?${params.toString()}`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Error al realizar la búsqueda de tareas');
  }

  return response.json();
};

// RF-15: Listar subtareas de una tarea padre
export const listarSubtareas = async (padreId: number): Promise<Tarea[]> => {
  const response = await fetch(`${BASE_URL}/${padreId}/subtareas`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    throw new Error('Error al obtener subtareas');
  }
  return response.json();
};

// RF-18: Listar comentarios de una tarea
export const listarComentarios = async (tareaId: number): Promise<Comentario[]> => {
  const response = await fetch(`${BASE_URL}/${tareaId}/comentarios`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    throw new Error('Error al obtener comentarios');
  }
  return response.json();
};

// RF-18: Agregar un comentario a una tarea
export const agregarComentario = async (tareaId: number, contenido: string): Promise<Comentario> => {
  const response = await fetch(`${BASE_URL}/${tareaId}/comentarios`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ contenido }),
  });
  if (!response.ok) {
    throw new Error('Error al agregar comentario');
  }
  return response.json();
};

// RF-06: Subir archivo de evidencia
export const subirEvidenciaArchivo = async (tareaId: number, file: File): Promise<{ url: string }> => {
  const auth = loadAuth();
  const headers = {
    'Authorization': `Bearer ${auth?.token ?? ''}`,
  };

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/${tareaId}/evidencias/upload`, {
    method: 'POST',
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Error al subir el archivo de evidencia');
  }

  return response.json();
};

// RF-06: Registrar URL de evidencia
export const agregarEvidenciaUrl = async (tareaId: number, url: string): Promise<Tarea> => {
  const response = await fetch(`${BASE_URL}/${tareaId}/evidencias/url`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error('Error al agregar la URL de evidencia');
  }

  return response.json();
};

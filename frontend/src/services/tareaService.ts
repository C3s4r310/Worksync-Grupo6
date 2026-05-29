import type { Tarea, TareaRequest } from '../types/tarea';

// URL base del backend Spring Boot
const BASE_URL = 'http://localhost:8080/api/tareas';

// Obtiene el token JWT guardado en sessionStorage
const getAuthHeader = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token') ?? ''}`,
});

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

// RF-05: Cambiar solo el estado de una tarea
export const cambiarEstadoTarea = async (id: number, nuevoEstado: string): Promise<Tarea> => {
  const response = await fetch(`${BASE_URL}/${id}/estado?nuevoEstado=${nuevoEstado}`, {
    method: 'PUT',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Error al cambiar el estado de la tarea');
  }

  return response.json();
};
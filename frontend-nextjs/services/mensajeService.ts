import { loadAuth } from '../utils/storage';
import { Mensaje, ProyectoMiembrosChat } from '../types/mensaje';

const BASE_URL = 'http://localhost:8080/api/mensajes';

const getAuthHeader = (): HeadersInit => {
  const auth = loadAuth();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth?.token ?? ''}`,
  };
};

export const obtenerContactos = async (): Promise<ProyectoMiembrosChat[]> => {
  const response = await fetch(`${BASE_URL}/contactos`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al obtener la lista de contactos');
  }

  return response.json();
};

export const obtenerHistorial = async (receptorId: number): Promise<Mensaje[]> => {
  const response = await fetch(`${BASE_URL}/historial/${receptorId}`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al obtener el historial de chat');
  }

  return response.json();
};

export const enviarMensaje = async (
  receptorId: number,
  contenido: string,
  proyectoId?: number
): Promise<Mensaje> => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ receptorId, contenido, proyectoId }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al enviar el mensaje');
  }

  return response.json();
};

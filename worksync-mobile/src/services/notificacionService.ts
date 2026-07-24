import type { Notificacion } from '../types/notificacion';
import { loadAuth } from '../utils/storage';
import { API_BASE_URL } from './apiConfig';

const BASE_URL = `${API_BASE_URL}/notificaciones`;

const getAuthHeader = (): HeadersInit => {
  const auth = loadAuth();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth?.token ?? ''}`,
  };
};

export const listarNotificaciones = async (): Promise<Notificacion[]> => {
  const response = await fetch(BASE_URL, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al listar las notificaciones');
  }

  return response.json();
};

export const marcarComoLeida = async (id: number): Promise<Notificacion> => {
  const response = await fetch(`${BASE_URL}/${id}/leer`, {
    method: 'PUT',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al marcar la notificación como leída');
  }

  return response.json();
};

export const dispararAlertasManualmente = async (): Promise<string> => {
  const response = await fetch(`${BASE_URL}/ejecutar-alertas`, {
    method: 'POST',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al disparar alertas manualmente');
  }

  return response.text();
};

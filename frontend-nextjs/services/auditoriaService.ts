import { loadAuth } from '../utils/storage';
import { API_BASE_URL } from './apiConfig';

export interface AuditoriaDTO {
  id: number;
  usuarioCorreo: string;
  usuarioNombre: string;
  accion: string;
  detalles: string;
  fecha: string;
}

// RF-28 Auditoría del Sistema: Cargar bitácora de auditoría
export const obtenerAuditoria = async (): Promise<AuditoriaDTO[]> => {
  const auth = loadAuth();
  const response = await fetch(`${API_BASE_URL}/auditoria`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth?.token ?? ''}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al obtener la bitácora de auditoría.');
  }

  return response.json();
};

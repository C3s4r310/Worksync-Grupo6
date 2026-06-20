import { loadAuth } from '../utils/storage';

const getBaseUrl = (proyectoId: number) => `http://localhost:8080/api/proyectos/${proyectoId}/miembros`;

const getAuthHeader = (): HeadersInit => {
  const auth = loadAuth();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth?.token ?? ''}`,
  };
};

export interface MiembroDTO {
  id: number;
  proyectoId: number;
  usuarioId: number;
  nombreUsuario: string;
  correoUsuario: string;
  rol: string;
  fechaIngreso: string;
  activo: boolean;
}

// RF-09: Listar miembros activos de un proyecto
export const listarMiembros = async (proyectoId: number): Promise<MiembroDTO[]> => {
  const response = await fetch(getBaseUrl(proyectoId), {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al listar los miembros del proyecto');
  }

  return response.json();
};

// RF-09: Agregar miembro a un proyecto
export const agregarMiembro = async (proyectoId: number, usuarioId: number, rol: string): Promise<MiembroDTO> => {
  const response = await fetch(getBaseUrl(proyectoId), {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ usuarioId, rol }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al agregar el miembro al proyecto');
  }

  return response.json();
};

// RF-09: Retirar miembro de un proyecto
export const retirarMiembro = async (proyectoId: number, usuarioId: number): Promise<void> => {
  const response = await fetch(`${getBaseUrl(proyectoId)}/${usuarioId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al retirar el miembro del proyecto');
  }
};

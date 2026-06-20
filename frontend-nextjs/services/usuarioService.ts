import { loadAuth } from '../utils/storage';

const BASE_URL = 'http://localhost:8080/api/usuarios';

const getAuthHeader = (): HeadersInit => {
  const auth = loadAuth();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth?.token ?? ''}`,
  };
};

export interface UsuarioDTO {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

// RF-08: Listar todos los usuarios
export const obtenerUsuarios = async (): Promise<UsuarioDTO[]> => {
  const response = await fetch(BASE_URL, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al obtener los usuarios del sistema');
  }

  return response.json();
};

// RF-08: Cambiar rol de un usuario
export const cambiarRolUsuario = async (id: number, rol: string): Promise<UsuarioDTO> => {
  const response = await fetch(`${BASE_URL}/${id}/rol`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify({ rol }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al cambiar el rol del usuario');
  }

  return response.json();
};

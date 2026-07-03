import { db } from '../utils/localDb';

export interface UsuarioDTO {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

// RF-08: Listar todos los usuarios
export const obtenerUsuarios = async (): Promise<UsuarioDTO[]> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const list = db.usuarios.getAll();
  return list.map(u => ({
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    rol: u.rol
  }));
};

// RF-08: Cambiar rol de un usuario
export const cambiarRolUsuario = async (id: number, rol: string): Promise<UsuarioDTO> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const updated = db.usuarios.update(id, { rol });
  return {
    id: updated.id,
    nombre: updated.nombre,
    correo: updated.correo,
    rol: updated.rol
  };
};

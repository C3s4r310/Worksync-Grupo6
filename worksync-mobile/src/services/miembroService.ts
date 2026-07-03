import { db } from '../utils/localDb';

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
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const list = db.miembros.getByProyecto(proyectoId);
  const result: MiembroDTO[] = [];

  for (const m of list) {
    const user = db.usuarios.getById(m.usuarioId);
    if (user) {
      result.push({
        id: m.id,
        proyectoId: m.proyectoId,
        usuarioId: m.usuarioId,
        nombreUsuario: user.nombre,
        correoUsuario: user.correo,
        rol: m.rol,
        fechaIngreso: m.fechaIngreso,
        activo: m.activo
      });
    }
  }

  return result;
};

// RF-09: Agregar miembro a un proyecto
export const agregarMiembro = async (proyectoId: number, usuarioId: number, rol: string): Promise<MiembroDTO> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  // Verificar si ya existe pero inactivo
  const existing = db.miembros.getAll().find(m => m.proyectoId === proyectoId && m.usuarioId === usuarioId);
  let rawMemb;
  if (existing) {
    // Activar de nuevo
    const list = db.miembros.getAll();
    const idx = list.findIndex(m => m.id === existing.id);
    list[idx].activo = true;
    list[idx].rol = rol;
    localStorage.setItem('ws_db_miembros', JSON.stringify(list));
    rawMemb = list[idx];
  } else {
    rawMemb = db.miembros.create({
      proyectoId,
      usuarioId,
      rol
    });
  }

  const user = db.usuarios.getById(usuarioId);
  return {
    id: rawMemb.id,
    proyectoId: rawMemb.proyectoId,
    usuarioId: rawMemb.usuarioId,
    nombreUsuario: user?.nombre || 'Usuario',
    correoUsuario: user?.correo || '',
    rol: rawMemb.rol,
    fechaIngreso: rawMemb.fechaIngreso,
    activo: rawMemb.activo
  };
};

// RF-09: Retirar miembro de un proyecto
export const retirarMiembro = async (proyectoId: number, usuarioId: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  db.miembros.remove(proyectoId, usuarioId);
};

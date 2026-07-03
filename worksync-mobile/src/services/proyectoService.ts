import type { Proyecto, ProyectoRequest, FiltrosProyecto } from '../types/proyecto';
import type { Page } from '../types/tarea';
import { db } from '../utils/localDb';
import { loadAuth } from '../utils/storage';

// RF-02: Crear un proyecto
export const crearProyecto = async (datos: ProyectoRequest): Promise<Proyecto> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const auth = loadAuth();
  const userName = auth?.user?.username || 'Sistema';

  const newProj = db.proyectos.create({
    nombre: datos.nombre,
    descripcion: datos.descripcion || '',
    estado: datos.estado || 'ACTIVO',
    fechaInicio: datos.fechaInicio || new Date().toISOString().split('T')[0],
    fechaFin: datos.fechaFin || '',
    prioridad: datos.prioridad || 'MEDIA',
    responsable: userName
  });

  // Al crear un proyecto, agregar automáticamente al creador como Líder de Proyecto
  if (auth?.user?.id) {
    db.miembros.create({
      proyectoId: newProj.id,
      usuarioId: auth.user.id,
      rol: 'LIDER'
    });
  }

  return newProj as unknown as Proyecto;
};

// RF-02: Editar un proyecto
export const editarProyecto = async (id: number, datos: Partial<ProyectoRequest>): Promise<Proyecto> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const updated = db.proyectos.update(id, datos);
  return updated as unknown as Proyecto;
};

// RF-02: Eliminar proyecto (lógicamente)
export const eliminarProyecto = async (id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  db.proyectos.delete(id);
};

// --- LO NUEVO PARA TUS FILTROS (RF-24 y RNF-01) ---
export const buscarProyectos = async (filtros: FiltrosProyecto): Promise<Page<Proyecto>> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  let list = db.proyectos.getAll();

  // Filtrar por estado
  if (filtros.estado) {
    list = list.filter(p => p.estado === filtros.estado);
  }

  // Filtrar por palabra clave (nombre o descripción)
  if (filtros.palabraClave) {
    const query = filtros.palabraClave.toLowerCase();
    list = list.filter(p => 
      p.nombre.toLowerCase().includes(query) || 
      p.descripcion.toLowerCase().includes(query)
    );
  }

  // Filtrar por fecha de inicio
  if (filtros.fechaInicio) {
    list = list.filter(p => p.fechaInicio >= (filtros.fechaInicio || ''));
  }

  const page = filtros.page || 0;
  const size = filtros.size || 10;
  const totalElements = list.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  
  const content = list.slice(page * size, (page + 1) * size) as unknown as Proyecto[];

  return {
    content,
    totalElements,
    totalPages,
    size,
    number: page
  };
};

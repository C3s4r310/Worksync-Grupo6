import type { Proyecto, ProyectoRequest, FiltrosProyecto } from '../types/proyecto';
import type { Page } from '../types/tarea'; // Aprovechamos la interfaz genérica que ya creamos en tareas

// URL base del backend Spring Boot
const BASE_URL = 'http://localhost:8080/api/proyectos';

// Obtiene el token JWT guardado en sessionStorage
const getAuthHeader = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('token') ?? ''}`,
});

// RF-02: Crear un proyecto
export const crearProyecto = async (datos: ProyectoRequest): Promise<string> => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al crear el proyecto');
  }

  return response.text(); // El controlador de Java devuelve un texto simple aquí
};

// RF-02: Editar un proyecto
export const editarProyecto = async (id: number, datos: Partial<ProyectoRequest>): Promise<string> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al actualizar el proyecto');
  }

  return response.text();
};

// --- LO NUEVO PARA TUS FILTROS (RF-24 y RNF-01) ---
export const buscarProyectos = async (filtros: FiltrosProyecto): Promise<Page<Proyecto>> => {
  const params = new URLSearchParams();
  
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros.palabraClave) params.append('palabraClave', filtros.palabraClave);
  
  // Paginación por defecto para RNF-01 (Rendimiento)
  params.append('page', (filtros.page || 0).toString());
  params.append('size', (filtros.size || 10).toString());

  const response = await fetch(`${BASE_URL}/buscar?${params.toString()}`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Error al realizar la búsqueda de proyectos');
  }

  return response.json(); // Tu método buscarYFiltrarProyectos de Java devuelve un JSON paginado
};
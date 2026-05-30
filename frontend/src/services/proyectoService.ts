import type { FiltrosProyecto, Proyecto } from '../types/proyecto';

const BASE_URL = 'http://localhost:8080/api/proyectos';

const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('worksync_auth') 
    ? JSON.parse(localStorage.getItem('worksync_auth')!).token 
    : ''}`,
});

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function buscarProyectos(filtros: FiltrosProyecto): Promise<Page<Proyecto>> {
  const params = new URLSearchParams();
  if (filtros.palabraClave) params.set('palabraClave', filtros.palabraClave);
  if (filtros.estado)       params.set('estado', filtros.estado);
  if (filtros.fechaInicio)  params.set('fechaInicio', filtros.fechaInicio);

  const url = `${BASE_URL}/buscar?${params.toString()}`;
  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) throw new Error('Error al buscar proyectos');

  // Si el backend no tiene paginación aún, envuelve la respuesta
  const data = await response.json();
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length };
  }
  return data;
}

export async function listarProyectos(): Promise<Proyecto[]> {
  const response = await fetch(BASE_URL, { headers: getHeaders() });
  if (!response.ok) throw new Error('Error al listar proyectos');
  return response.json();
}

export async function crearProyecto(datos: Partial<Proyecto>): Promise<Proyecto> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function editarProyecto(id: number, datos: Partial<Proyecto>): Promise<Proyecto> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datos),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
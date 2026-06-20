import type { ReporteDashboardData } from '../types/reporte';
import { loadAuth } from '../utils/storage';

const BASE_URL = 'http://localhost:8080/api/reportes';

const getAuthHeader = (): HeadersInit => {
  const auth = loadAuth();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth?.token ?? ''}`,
  };
};

export const obtenerReportes = async (): Promise<ReporteDashboardData> => {
  const response = await fetch(BASE_URL, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al obtener los datos de los reportes');
  }

  return response.json();
};

import type { DashboardData } from '../types/dashboard';
import { loadAuth } from '../utils/storage';
import { API_BASE_URL } from './apiConfig';

const BASE_URL = `${API_BASE_URL}/dashboard`;

const getAuthHeader = (): HeadersInit => {
  const auth = loadAuth();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth?.token ?? ''}`,
  };
};

export const obtenerDashboard = async (): Promise<DashboardData> => {
  const response = await fetch(BASE_URL, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al obtener los datos del dashboard');
  }

  return response.json();
};

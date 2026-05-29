import axios from 'axios';
import type { AuthRequest, AuthResponse, RegisterRequest } from '../types/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as { message?: string };
    return data.message || 'Error de autenticación. Intenta de nuevo.';
  }

  return 'Error de autenticación. Intenta de nuevo.';
}

export async function login(data: AuthRequest): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>('/login', data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>('/register', data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

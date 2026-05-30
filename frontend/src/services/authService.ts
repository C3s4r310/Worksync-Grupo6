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
    const data = error.response.data;
    return typeof data === 'string' ? data : 'Error de autenticación. Intenta de nuevo.';
  }
  return 'Error de autenticación. Intenta de nuevo.';
}

export async function login(data: AuthRequest): Promise<AuthResponse> {
  try {
    // Backend espera: { correo, contrasena }
    const response = await apiClient.post<string>('/login', {
      correo: data.email,
      contrasena: data.password,
    });

    // Backend devuelve solo el token como string — lo envolvemos en AuthResponse
    return {
      token: response.data,
      user: { username: data.email },
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  try {
    // Backend espera: { nombre, correo, contrasena } — endpoint: /registro
    await apiClient.post('/registro', {
      nombre: data.username,
      correo: data.email,
      contrasena: data.password,
    });

    // Tras registrar, hacemos login automático para obtener el token
    return await login({ email: data.email, password: data.password });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
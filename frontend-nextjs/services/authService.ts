import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import type { AuthRequest, AuthResponse, RegisterRequest } from '../types/auth';
import { loadAuth } from '../utils/storage';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
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

// Helper para decodificar la parte del payload del JWT en base64 de manera segura
function decodeJwt(token: string): { sub?: string; rol?: string; id?: number; nombre?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function login(data: AuthRequest): Promise<AuthResponse> {
  try {
    // Backend espera: { correo, contrasena }
    const response = await apiClient.post<string>('/login', {
      correo: data.email,
      contrasena: data.password,
    });

    const token = response.data;
    const claims = decodeJwt(token);
    const email = claims?.sub || data.email;
    const rol = claims?.rol || 'COLABORADOR';
    const id = claims?.id || undefined;
    const username = claims?.nombre || email.split('@')[0];

    // Devuelve el token envuelto en AuthResponse con los datos decodificados
    return {
      token,
      user: { id, username, email, rol },
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  try {
    // Backend espera: { nombre, correo, contrasena, rol } — endpoint: /registro
    await apiClient.post('/registro', {
      nombre: data.username,
      correo: data.email,
      contrasena: data.password,
      rol: data.rol,
    });

    // Tras registrar, hacemos login automático para obtener el token
    return await login({ email: data.email, password: data.password });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// RF-01: Recuperar contraseña de un usuario
export async function recuperarContrasena(email: string, nuevaContrasena: string): Promise<string> {
  try {
    const response = await apiClient.post<string>('/recuperar-contrasena', {
      correo: email,
      nuevaContrasena: nuevaContrasena
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw new Error(String(error.response.data));
    }
    throw new Error('Error al intentar recuperar la contraseña. Intente de nuevo.');
  }
}

// RF-01: Cambiar contraseña personal del usuario logueado
export async function cambiarContrasena(contrasenaActual: string, nuevaContrasena: string): Promise<void> {
  const auth = loadAuth();
  const response = await fetch(`${API_BASE_URL}/usuarios/cambiar-contrasena`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth?.token ?? ''}`,
    },
    body: JSON.stringify({ contrasenaActual, nuevaContrasena }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al cambiar la contraseña');
  }
}


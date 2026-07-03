import type { AuthRequest, AuthResponse, RegisterRequest } from '../types/auth';
import { loadAuth } from '../utils/storage';
import { db } from '../utils/localDb';

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

// Generador de JWT falsos para seguir decodificando de forma transparente
function generateMockJwt(user: { id: number; nombre: string; correo: string; rol: string }): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    sub: user.correo,
    id: user.id,
    nombre: user.nombre,
    rol: user.rol,
    exp: Math.floor(Date.now() / 1000) + 3600 * 24 // 24 Horas
  }));
  const signature = "mocksignature";
  return `${header}.${payload}.${signature}`;
}

export async function login(data: AuthRequest): Promise<AuthResponse> {
  // Simular latencia de red corta
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const user = db.usuarios.getByCorreo(data.email);
  if (!user || user.contrasena !== data.password) {
    throw new Error('Credenciales inválidas. Por favor intenta de nuevo.');
  }

  // Guardar última conexión
  db.usuarios.update(user.id, { ultimaConexion: new Date().toISOString() });

  const token = generateMockJwt(user);
  return {
    token,
    user: {
      id: user.id,
      username: user.nombre,
      email: user.correo,
      rol: user.rol
    }
  };
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const existing = db.usuarios.getByCorreo(data.email);
  if (existing) {
    throw new Error('El correo electrónico ya se encuentra registrado.');
  }

  const newUser = db.usuarios.create({
    nombre: data.username,
    correo: data.email,
    contrasena: data.password,
    rol: data.rol || 'COLABORADOR',
    ultimaConexion: new Date().toISOString()
  });

  const token = generateMockJwt(newUser);
  return {
    token,
    user: {
      id: newUser.id,
      username: newUser.nombre,
      email: newUser.correo,
      rol: newUser.rol
    }
  };
}

// RF-01: Recuperar contraseña de un usuario
export async function recuperarContrasena(email: string, nuevaContrasena: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const user = db.usuarios.getByCorreo(email);
  if (!user) {
    throw new Error('El correo electrónico no existe en el sistema.');
  }

  db.usuarios.update(user.id, { contrasena: nuevaContrasena });
  return 'Contraseña restablecida exitosamente en el almacenamiento local.';
}

// RF-01: Cambiar contraseña personal del usuario logueado
export async function cambiarContrasena(contrasenaActual: string, nuevaContrasena: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const auth = loadAuth();
  if (!auth || !auth.user || !auth.user.id) {
    throw new Error('Sesión no válida.');
  }

  const user = db.usuarios.getById(auth.user.id);
  if (!user || user.contrasena !== contrasenaActual) {
    throw new Error('La contraseña actual es incorrecta.');
  }

  db.usuarios.update(user.id, { contrasena: nuevaContrasena });
}

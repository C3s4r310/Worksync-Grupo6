"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register as registerRequest } from '@/services/authService';
import useAuth from '@/hooks/useAuth';

export default function Register() {
  const auth = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('COLABORADOR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      router.replace('/home');
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!username || !email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres y contener letras y números.');
      return;
    }

    setLoading(true);

    try {
      const response = await registerRequest({ username, email, password, rol });
      auth.login(response);
      router.replace('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  if (auth.isAuthenticated) {
    return null; // El useEffect se encargará de la redirección
  }

  return (
    <main className="page-container flex-center">
      <section className="auth-card">
        <h1 className="title-xl">Crear cuenta</h1>
        <p className="subtitle-auth">Regístrate y empieza a usar WorkSync.</p>

        <form onSubmit={handleSubmit} className="form-layout">
          <label className="form-label">
            Usuario
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="form-input"
              placeholder="Nombre de usuario"
            />
          </label>

          <label className="form-label">
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="form-input"
              placeholder="usuario@correo.com"
            />
          </label>

          <label className="form-label">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="form-input"
              placeholder="********"
            />
            <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
              Mínimo 8 caracteres con letras y números.
            </span>
          </label>

          <label className="form-label">
            Rol en la plataforma
            <select
              value={rol}
              onChange={(event) => setRol(event.target.value)}
              className="form-input"
              style={{
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px',
                paddingRight: '36px'
              }}
            >
              <option value="COLABORADOR">Colaborador</option>
              <option value="LIDER">Líder de Proyecto</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
            </select>
          </label>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-footer-text">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="link-highlight">
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}

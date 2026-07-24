"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login as loginRequest } from '@/services/authService';
import useAuth from '@/hooks/useAuth';

// RF-01 Autenticación y Seguridad: Formulario de inicio de sesión.
export default function Login() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const response = await loginRequest({ email, password });
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
        <h1 className="title-xl">Iniciar sesión</h1>
        <p className="subtitle-auth">Accede con tu correo y contraseña para continuar.</p>

        <form onSubmit={handleSubmit} className="form-layout">
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
          </label>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
          <p className="auth-footer-text" style={{ margin: 0 }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="link-highlight">
              Regístrate
            </Link>
          </p>
          <Link href="/login/recovery" className="link-highlight" style={{ fontSize: '13px' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </section>
    </main>
  );
}

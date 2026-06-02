"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { recuperarContrasena } from '@/services/authService';

export default function RecoveryPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // RF-01 Password strength validations
  const isSecurePassword = (pass: string) => {
    return pass.length >= 8 && /[a-zA-Z]/.test(pass) && /[0-9]/.test(pass);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!isSecurePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres y contener letras y números.');
      return;
    }

    setLoading(true);

    try {
      const message = await recuperarContrasena(email, password);
      setSuccess(message || 'Contraseña restablecida correctamente.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al recuperar contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-container flex-center">
      <section className="auth-card">
        <h1 className="title-xl">Recuperar contraseña</h1>
        <p className="subtitle-auth">Escribe tu correo electrónico para restablecer tu contraseña.</p>

        {success ? (
          <div style={{
            color: '#059669',
            backgroundColor: '#ecfdf5',
            border: '1px solid #d1fae5',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            fontWeight: 500
          }}>
            ✓ {success} Redirigiendo a inicio de sesión...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-layout">
            <label className="form-label">
              Correo electrónico
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="form-input"
                placeholder="usuario@correo.com"
                required
              />
            </label>

            <label className="form-label">
              Nueva Contraseña
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="form-input"
                placeholder="********"
                required
              />
              <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                Mínimo 8 caracteres con letras y números.
              </span>
            </label>

            <label className="form-label">
              Confirmar Nueva Contraseña
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="form-input"
                placeholder="********"
                required
              />
            </label>

            {error && <p className="error-text">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </button>
          </form>
        )}

        <p className="auth-footer-text">
          ¿Recordaste tu contraseña?{' '}
          <Link href="/login" className="link-highlight">
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}

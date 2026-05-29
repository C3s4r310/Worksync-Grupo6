import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../services/authService';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

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
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/home" replace />;
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

        <p className="auth-footer-text">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="link-highlight">
            Regístrate
          </Link>
        </p>
      </section>
    </main>
  );
}

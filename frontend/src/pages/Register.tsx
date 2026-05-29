import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { register as registerRequest } from '../services/authService';
import useAuth from '../hooks/useAuth';

export default function Register() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
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

    if (!username || !email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const response = await registerRequest({ username, email, password });
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
          <Link to="/login" className="link-highlight">
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}

import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Home() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="page-container">
      <section className="panel-card">
        <div className="panel-header-layout">
          <div>
            <p className="label-welcome">Bienvenido</p>
            <h1 className="title-large">Hola, {auth.user?.username || auth.user?.email}</h1>
            <p className="subtitle-panel">
              Estás conectado y puedes acceder a tu tablero protegido por autenticación.
            </p>
          </div>

          <div className="btn-group-layout">
            <Link
              to="/proyectos"
              className="btn-primary-link"
            >
              💼 Ver Proyectos
            </Link>
            <Link
              to="/dashboard"
              className="btn-secondary-link"
            >
              Ir al Dashboard
            </Link>
            <button
              onClick={auth.logout}
              className="btn-secondary"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

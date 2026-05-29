import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Dashboard() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="page-container">
      <section className="panel-card">
        <div className="panel-header-layout" style={{ marginBottom: '32px' }}>
          <div>
            <p className="label-welcome">Panel</p>
            <h1 className="title-medium">Dashboard</h1>
            <p className="subtitle-panel">
              Aquí puedes revisar métricas y acciones importantes de tu cuenta.
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
              to="/home"
              className="btn-secondary-link"
            >
              Volver a Home
            </Link>
            <button
              onClick={auth.logout}
              className="btn-secondary"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="grid-dashboard">
          <article className="dashboard-card">
            <h2 className="title-card">Actividad</h2>
            <p className="subtitle-panel" style={{ marginTop: '0' }}>Tu sesión está activa y tus datos se mantienen protegidos con JWT.</p>
          </article>

          <article className="dashboard-card">
            <h2 className="title-card">Cuenta</h2>
            <p className="subtitle-panel" style={{ marginTop: '0' }}>Usuario: {auth.user?.username || auth.user?.email}</p>
          </article>
        </div>
      </section>
    </main>
  );
}

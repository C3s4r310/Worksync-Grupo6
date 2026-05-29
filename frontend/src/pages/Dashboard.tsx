import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Dashboard() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-[#F4F5F7] px-4 py-10">
      <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Panel</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Aquí puedes revisar métricas y acciones importantes de tu cuenta.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/home"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Volver a Home
            </Link>
            <button
              onClick={auth.logout}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Actividad</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Tu sesión está activa y tus datos se mantienen protegidos con JWT.</p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Cuenta</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Usuario: {auth.user?.username || auth.user?.email}</p>
          </article>
        </div>
      </section>
    </main>
  );
}

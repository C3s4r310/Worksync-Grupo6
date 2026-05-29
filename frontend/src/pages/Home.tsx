import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Home() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-[#F4F5F7] px-4 py-10">
      <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Bienvenido</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">Hola, {auth.user?.username || auth.user?.email}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Estás conectado y puedes acceder a tu tablero protegido por autenticación.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Ir al Dashboard
            </Link>
            <button
              onClick={auth.logout}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

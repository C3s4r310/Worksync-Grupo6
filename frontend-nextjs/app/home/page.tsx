"use client";

import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <AppLayout>
        <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#2563eb', color: '#fff',
            fontSize: 28, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            {(user?.username?.[0] ?? 'U').toUpperCase()}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
            Bienvenido, {user?.username ?? 'Usuario'}
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32 }}>
            Gestiona tus proyectos y tareas desde WorkSync.
          </p>
          <button
            className="ws-btn-primary"
            onClick={() => router.push('/proyectos')}
            style={{ fontSize: 15, padding: '11px 28px', cursor: 'pointer' }}
          >
            💼 Ver mis proyectos
          </button>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

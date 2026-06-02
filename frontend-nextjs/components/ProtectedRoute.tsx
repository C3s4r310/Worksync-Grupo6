"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace('/login');
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  // Si está cargando el estado inicial de localStorage, mostrar spinner o pantalla vacía
  if (auth.isLoading || !auth.isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f5f7',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid #cbd5e1',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

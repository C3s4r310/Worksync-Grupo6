"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function Home() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

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
          Cargando WorkSync...
        </p>
      </div>
    </div>
  );
}

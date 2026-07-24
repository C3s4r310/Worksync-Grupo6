"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { obtenerDashboard } from '@/services/dashboardService';
import type { DashboardData } from '@/types/dashboard';
import { PRIORIDAD_CONFIG } from '@/types/tarea';

const ESTADOS: Record<string, string> = {
  PENDIENTE:   'ws-badge ws-badge-pendiente',
  EN_PROGRESO: 'ws-badge ws-badge-progreso',
  BLOQUEADA:   'ws-badge ws-badge-bloqueada',
  EN_REVISION: 'ws-badge ws-badge-revision',
  OBSERVADA:   'ws-badge ws-badge-observada',
  COMPLETADA:  'ws-badge ws-badge-completada',
  CANCELADA:   'ws-badge ws-badge-cancelada',
};

const LABEL_ESTADO: Record<string, string> = {
  PENDIENTE:   'Pendiente',
  EN_PROGRESO: 'En progreso',
  BLOQUEADA:   'Bloqueada',
  EN_REVISION: 'En revisión',
  OBSERVADA:   'Observada',
  COMPLETADA:  'Completada',
  CANCELADA:   'Cancelado',
};

// RF-19 Dashboard Ejecutivo: KPI Cards (Proyectos Activos, Tareas Pendientes, Tareas Próximas a Vencer).
// RF-17 Historial: Feed de Actividades Recientes de cambios de estado.
// RF-07 Progreso: Indicación visual del estado del proyecto en la pantalla principal.
export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setCargando(true);
      setError('');
      const dbData = await obtenerDashboard();
      setData(dbData);
    } catch (err: any) {
      console.error(err);
      setError('No se pudieron cargar los datos del panel.');
    } finally {
      setCargando(false);
    }
  };

  // Formateadores locales
  const getEstadoLabel = (est: string) => LABEL_ESTADO[est.toUpperCase()] || est;
  
  const getEstadoBadgeClass = (est: string) => {
    const normalized = est.toUpperCase();
    return ESTADOS[normalized] || 'ws-badge';
  };

  function formatRelativeTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffSec < 60) return 'Hace unos segundos';
      if (diffMin < 60) return `Hace ${diffMin} min`;
      if (diffHr < 24) return `Hace ${diffHr} hr`;
      if (diffDay === 1) return 'Ayer';
      if (diffDay < 7) return `Hace ${diffDay} días`;
      
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateString;
    }
  }

  function formatDeadline(dateStr: string): string {
    if (!dateStr) return 'Sin fecha';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        {/* Estilos Premium del Dashboard */}
        <style>{`
          .db-header {
            margin-bottom: 28px;
          }
          .db-greeting {
            font-size: 26px;
            font-weight: 700;
            background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 4px;
            letter-spacing: -0.5px;
          }
          .db-subtitle {
            font-size: 14px;
            color: var(--text-secondary);
          }

          /* KPI Grid */
          .db-kpis {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 32px;
          }
          @media (min-width: 768px) {
            .db-kpis {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          .db-card {
            background: var(--bg-white);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            cursor: pointer;
            box-shadow: var(--shadow-sm);
          }
          .db-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(168, 85, 247, 0.15);
            border-color: rgba(168, 85, 247, 0.25);
          }
          .db-card-alert {
            border-left: 4px solid #f87171 !important;
          }
          .db-card-info {
            display: flex;
            flex-direction: column;
          }
          .db-card-title {
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-secondary);
            margin-bottom: 6px;
          }
          .db-card-value {
            font-size: 32px;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1;
            margin-bottom: 4px;
          }
          .db-card-desc {
            font-size: 12px;
            color: var(--text-muted);
          }
          .db-card-icon {
            width: 48px;
            height: 48px;
            border-radius: var(--radius-sm);
            background-color: rgba(255, 255, 255, 0.03);
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            transition: all 0.25s;
            border: 1px solid var(--border);
          }
          .db-card:hover .db-card-icon {
            background-color: rgba(255, 255, 255, 0.08);
            color: var(--accent-secondary);
            border-color: rgba(255, 255, 255, 0.2);
          }
          .db-card-alert .db-card-icon {
            background-color: rgba(239, 68, 68, 0.1);
            color: #f87171;
            border-color: rgba(239, 68, 68, 0.2);
          }
          .db-card-alert:hover .db-card-icon {
            background-color: rgba(239, 68, 68, 0.15);
            border-color: rgba(239, 68, 68, 0.3);
          }

          /* Two Column Section Layout */
          .db-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            align-items: start;
          }
          @media (min-width: 1024px) {
            .db-layout {
              grid-template-columns: 3fr 2fr;
            }
          }

          .db-section {
            background: var(--bg-white);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 24px;
            box-shadow: var(--shadow-md);
          }
          .db-section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 12px;
          }
          .db-section-title {
            font-size: 17px;
            font-weight: 700;
            color: var(--text-primary);
          }
          .db-section-link {
            font-size: 12px;
            font-weight: 600;
            color: var(--accent-secondary);
            cursor: pointer;
            background: none;
            border: none;
            padding: 0;
            transition: color 0.2s;
          }
          .db-section-link:hover {
            color: var(--accent);
            text-decoration: underline;
          }

          /* Critical Tasks Table */
          .db-table {
            width: 100%;
            border-collapse: collapse;
          }
          .db-table th {
            text-align: left;
            padding: 12px 14px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border);
            background-color: rgba(255, 255, 255, 0.02);
          }
          .db-table td {
            padding: 14px 12px;
            font-size: 13.5px;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border);
          }
          .db-table tr:last-child td {
            border-bottom: none;
          }
          .db-table-row {
            transition: background-color 0.15s;
            cursor: pointer;
          }
          .db-table-row:hover {
            background-color: rgba(255, 255, 255, 0.03);
          }
          .db-task-title {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 3px;
          }
          .db-task-proj {
            font-size: 11px;
            color: var(--text-muted);
          }

          /* Recent Activity Timeline */
          .db-timeline {
            position: relative;
            padding-left: 20px;
            list-style: none;
          }
          .db-timeline::before {
            content: '';
            position: absolute;
            top: 6px;
            left: 5px;
            bottom: 6px;
            width: 2px;
            background-color: var(--border);
          }
          .db-timeline-item {
            position: relative;
            margin-bottom: 24px;
          }
          .db-timeline-item:last-child {
            margin-bottom: 0;
          }
          .db-timeline-dot {
            position: absolute;
            left: -20px;
            top: 4px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #cbd5e1;
            border: 2px solid #07080c;
          }
          .db-dot-completada { background-color: #34d399; }
          .db-dot-progreso   { background-color: #60a5fa; }
          .db-dot-revision   { background-color: #fbbf24; }
          .db-dot-bloqueada  { background-color: #f87171; }
          .db-dot-observada  { background-color: #c084fc; }
          .db-dot-cancelada  { background-color: #94a3b8; }
          .db-dot-pendiente  { background-color: #64748b; }

          .db-act-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 4px;
          }
          .db-act-user {
            font-weight: 600;
            font-size: 13.5px;
            color: var(--text-primary);
          }
          .db-act-time {
            font-size: 11px;
            color: var(--text-muted);
          }
          .db-act-body {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.45;
          }
          .db-act-task {
            font-weight: 600;
            color: var(--accent-secondary);
            cursor: pointer;
          }
          .db-act-task:hover {
            text-decoration: underline;
          }
          .db-act-motivo {
            font-size: 12.5px;
            color: var(--text-secondary);
            font-style: italic;
            margin-top: 6px;
            background-color: rgba(255, 255, 255, 0.02);
            padding: 8px 12px;
            border-radius: var(--radius-sm);
            border-left: 3px solid var(--accent);
            word-break: break-word;
          }
          .db-transition {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-top: 4px;
            font-size: 11px;
          }
          .db-arrow {
            color: var(--text-muted);
          }

          /* Empty States */
          .db-empty {
            text-align: center;
            padding: 32px 16px;
            color: var(--text-muted);
            font-size: 13.5px;
          }
          .db-empty-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }

          /* Loading Spinner */
          .db-spinner-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 300px;
          }
          .db-spinner {
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid var(--accent-secondary);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        <div className="db-header">
          <h1 className="db-greeting">Hola, {user?.username ?? 'Usuario'}</h1>
          <p className="db-subtitle">Esto es lo que está ocurriendo hoy en tu panel operativo.</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>⚠️ {error}</span>
            <button 
              onClick={cargarDashboard}
              style={{
                background: 'none',
                border: 'none',
                color: '#b91c1c',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {cargando ? (
          <div className="db-spinner-wrap">
            <div className="db-spinner" />
          </div>
        ) : data ? (
          <>
            {/* KPI CARDS */}
            <div className="db-kpis">
              <div className="db-card" onClick={() => router.push('/proyectos')}>
                <div className="db-card-info">
                  <span className="db-card-title">Proyectos Activos</span>
                  <span className="db-card-value">{data.proyectosActivos}</span>
                  <span className="db-card-desc">Asignados o en gestión</span>
                </div>
                <div className="db-card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
              </div>

              <div className="db-card" onClick={() => router.push('/tareas')}>
                <div className="db-card-info">
                  <span className="db-card-title">Mis Tareas Pendientes</span>
                  <span className="db-card-value">{data.misTareasPendientes}</span>
                  <span className="db-card-desc">Asignadas a tu cuenta</span>
                </div>
                <div className="db-card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
              </div>

              <div className={`db-card ${data.vencenPronto > 0 ? 'db-card-alert' : ''}`} onClick={() => router.push('/tareas')}>
                <div className="db-card-info">
                  <span className="db-card-title">Vencen Pronto</span>
                  <span className="db-card-value">{data.vencenPronto}</span>
                  <span className="db-card-desc">Próximos 3 días</span>
                </div>
                <div className="db-card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2h14"/><path d="M5 22h14"/><path d="M19 2v4c0 3.3-2.7 6-6 6H11C7.7 12 5 9.3 5 6V2"/><path d="M19 22v-4c0-3.3-2.7-6-6-6H11c-3.3 0-6 2.7-6 6v4"/></svg>
                </div>
              </div>
            </div>

            {/* SECTIONS */}
            <div className="db-layout">
              {/* CRITICAL TASKS */}
              <div className="db-section">
                <div className="db-section-header">
                  <h2 className="db-section-title">Tareas Críticas</h2>
                  <button className="db-section-link" onClick={() => router.push('/tareas')}>
                    Ver todas
                  </button>
                </div>

                {data.tareasCriticas.length === 0 ? (
                  <div className="db-empty">
                    <div className="db-empty-icon">🎉</div>
                    <p>No tienes tareas críticas pendientes.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="db-table">
                      <thead>
                        <tr>
                          <th>Tarea</th>
                          <th>Prioridad</th>
                          <th>Fecha límite</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.tareasCriticas.map(t => {
                          const pri = t.prioridad || 'MEDIA';
                          const pConf = PRIORIDAD_CONFIG[pri] || PRIORIDAD_CONFIG.MEDIA;
                          return (
                            <tr 
                              key={t.id} 
                              className="db-table-row"
                              onClick={() => router.push(`/proyectos/${t.proyectoId}/tareas`)}
                            >
                              <td>
                                <div className="db-task-title">{t.titulo}</div>
                                <div className="db-task-proj">Proyecto #{t.proyectoId}</div>
                              </td>
                              <td>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  backgroundColor: pConf.bg,
                                  color: pConf.color,
                                }}>
                                  {pConf.label}
                                </span>
                              </td>
                              <td style={{ fontWeight: 500 }}>
                                {formatDeadline(t.fechaLimite)}
                              </td>
                              <td>
                                <span className={getEstadoBadgeClass(t.estado)}>
                                  {getEstadoLabel(t.estado)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* RECENT ACTIVITY TIMELINE */}
              <div className="db-section">
                <div className="db-section-header">
                  <h2 className="db-section-title">Actividad Reciente</h2>
                </div>

                {data.actividadReciente.length === 0 ? (
                  <div className="db-empty">
                    <div className="db-empty-icon">💬</div>
                    <p>No se registran cambios recientes.</p>
                  </div>
                ) : (
                  <ul className="db-timeline">
                    {data.actividadReciente.map(act => {
                      const lowerEstado = act.estadoNuevo.toLowerCase();
                      let dotColorClass = 'db-dot-pendiente';
                      if (lowerEstado.includes('comple')) dotColorClass = 'db-dot-completada';
                      else if (lowerEstado.includes('progre')) dotColorClass = 'db-dot-progreso';
                      else if (lowerEstado.includes('revi')) dotColorClass = 'db-dot-revision';
                      else if (lowerEstado.includes('bloque')) dotColorClass = 'db-dot-bloqueada';
                      else if (lowerEstado.includes('obser')) dotColorClass = 'db-dot-observada';
                      else if (lowerEstado.includes('cance')) dotColorClass = 'db-dot-cancelada';

                      return (
                        <li key={act.id} className="db-timeline-item">
                          <div className={`db-timeline-dot ${dotColorClass}`} />
                          <div className="db-act-header">
                            <span className="db-act-user">{act.usuarioNombre}</span>
                            <span className="db-act-time">{formatRelativeTime(act.fecha)}</span>
                          </div>
                          <div className="db-act-body">
                            Cambió el estado de{' '}
                            <span 
                              className="db-act-task" 
                              onClick={() => router.push(`/proyectos/${data.tareasCriticas.find(t => t.id === act.tareaId)?.proyectoId || 1}/tareas`)}
                            >
                              "{act.tareaTitulo}"
                            </span>
                            <div className="db-transition">
                              <span className={getEstadoBadgeClass(act.estadoAnterior)}>
                                {getEstadoLabel(act.estadoAnterior)}
                              </span>
                              <span className="db-arrow">➔</span>
                              <span className={getEstadoBadgeClass(act.estadoNuevo)}>
                                {getEstadoLabel(act.estadoNuevo)}
                              </span>
                            </div>
                            {act.motivo && act.motivo !== 'Cambio de estado.' && act.motivo !== 'Actualización general de tarea.' && (
                              <div className="db-act-motivo">
                                "{act.motivo}"
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="db-empty">
            <p>No hay información disponible.</p>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}

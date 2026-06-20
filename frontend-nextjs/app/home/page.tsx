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
            color: var(--primary-color);
            margin-bottom: 4px;
            letter-spacing: -0.5px;
          }
          .db-subtitle {
            font-size: 14px;
            color: var(--text-light);
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
            background-color: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }
          .db-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
            border-color: #cbd5e1;
          }
          .db-card-alert {
            border-left: 4px solid var(--error-color);
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
            color: var(--text-light);
            margin-bottom: 6px;
          }
          .db-card-value {
            font-size: 32px;
            font-weight: 700;
            color: var(--primary-color);
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
            border-radius: var(--radius-md);
            background-color: #f1f5f9;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            transition: background-color 0.2s;
          }
          .db-card:hover .db-card-icon {
            background-color: #e2e8f0;
            color: var(--accent-color);
          }
          .db-card-alert .db-card-icon {
            background-color: #fef2f2;
            color: var(--error-color);
          }
          .db-card-alert:hover .db-card-icon {
            background-color: #fee2e2;
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
            background-color: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }
          .db-section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 12px;
          }
          .db-section-title {
            font-size: 17px;
            font-weight: 700;
            color: var(--primary-color);
          }
          .db-section-link {
            font-size: 12px;
            font-weight: 600;
            color: var(--accent-color);
            cursor: pointer;
            background: none;
            border: none;
            padding: 0;
          }
          .db-section-link:hover {
            color: var(--accent-hover);
            text-decoration: underline;
          }

          /* Critical Tasks Table */
          .db-table {
            width: 100%;
            border-collapse: collapse;
          }
          .db-table th {
            text-align: left;
            padding: 10px 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-light);
            border-bottom: 1px solid var(--border-color);
            background-color: #fafbfc;
          }
          .db-table td {
            padding: 14px 12px;
            font-size: 13.5px;
            color: var(--text-muted);
            border-bottom: 1px solid #f1f5f9;
          }
          .db-table tr:last-child td {
            border-bottom: none;
          }
          .db-table-row {
            transition: background-color 0.15s;
            cursor: pointer;
          }
          .db-table-row:hover {
            background-color: #f8fafc;
          }
          .db-task-title {
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 3px;
          }
          .db-task-proj {
            font-size: 11px;
            color: var(--text-light);
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
            background-color: var(--border-color);
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
            border: 2px solid #ffffff;
            box-shadow: 0 0 0 1px rgba(9, 30, 66, 0.08);
          }
          .db-dot-completada { background-color: #22c55e; } /* Green */
          .db-dot-progreso   { background-color: #f97316; } /* Orange */
          .db-dot-revision   { background-color: #3b82f6; } /* Blue */
          .db-dot-bloqueada  { background-color: #ef4444; } /* Red */
          .db-dot-observada  { background-color: #a855f7; } /* Purple */
          .db-dot-cancelada  { background-color: #64748b; } /* Slate */
          .db-dot-pendiente  { background-color: #94a3b8; } /* Slate 400 */

          .db-act-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 4px;
          }
          .db-act-user {
            font-weight: 600;
            font-size: 13.5px;
            color: var(--primary-color);
          }
          .db-act-time {
            font-size: 11px;
            color: var(--text-light);
          }
          .db-act-body {
            font-size: 13px;
            color: var(--text-muted);
            line-height: 1.45;
          }
          .db-act-task {
            font-weight: 600;
            color: var(--accent-color);
            cursor: pointer;
          }
          .db-act-task:hover {
            text-decoration: underline;
          }
          .db-act-motivo {
            font-size: 12px;
            color: var(--text-light);
            font-style: italic;
            margin-top: 6px;
            background-color: #f8fafc;
            padding: 6px 10px;
            border-radius: 6px;
            border-left: 2px solid #cbd5e1;
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
            color: var(--text-light);
          }

          /* Empty States */
          .db-empty {
            text-align: center;
            padding: 32px 16px;
            color: var(--text-light);
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
            border: 3px solid #e2e8f0;
            border-top: 3px solid var(--accent-color);
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
                <div className="db-card-icon">💼</div>
              </div>

              <div className="db-card" onClick={() => router.push('/tareas')}>
                <div className="db-card-info">
                  <span className="db-card-title">Mis Tareas Pendientes</span>
                  <span className="db-card-value">{data.misTareasPendientes}</span>
                  <span className="db-card-desc">Asignadas a tu cuenta</span>
                </div>
                <div className="db-card-icon">🎯</div>
              </div>

              <div className={`db-card ${data.vencenPronto > 0 ? 'db-card-alert' : ''}`} onClick={() => router.push('/tareas')}>
                <div className="db-card-info">
                  <span className="db-card-title">Vencen Pronto</span>
                  <span className="db-card-value">{data.vencenPronto}</span>
                  <span className="db-card-desc">Próximos 3 días</span>
                </div>
                <div className="db-card-icon">⏳</div>
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

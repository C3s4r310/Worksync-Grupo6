import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import {
  logOutOutline,
  folderOutline,
  clipboardOutline,
  alarmOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { obtenerDashboard } from '../services/dashboardService';
import type { DashboardData } from '../types/dashboard';
import './Tab1.css';

const LABEL_ESTADO: Record<string, string> = {
  PENDIENTE:   'Pendiente',
  EN_PROGRESO: 'En progreso',
  EN_REVISION: 'En revisión',
  COMPLETADA:  'Completada',
};

const Tab1: React.FC = () => {
  const { logout, user } = useAuth();
  const history = useHistory();
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

  const getEstadoLabel = (est: string) => LABEL_ESTADO[est.toUpperCase()] || est;

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
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={logout} title="Cerrar sesión">
              <IonIcon icon={logOutOutline} slot="icon-only" color="danger" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="db-page-content ion-no-padding">
        
        {/* Sección de Bienvenida */}
        <div className="db-greeting-section">
          <h2 className="db-greeting-title">¡Hola, {user?.username || 'Usuario'}!</h2>
          <p className="db-greeting-subtitle">Bienvenido a tu panel de control offline de WorkSync.</p>
        </div>

        {cargando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <IonSpinner name="crescent" color="primary" />
          </div>
        ) : error ? (
          <div style={{
            color: '#f87171',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px',
            borderRadius: '8px',
            margin: '20px',
            fontSize: '13px'
          }}>
            ⚠️ {error}
          </div>
        ) : data ? (
          <>
            {/* Grid de Tarjetas KPI */}
            <div className="db-kpis-grid">
              
              <div className="db-kpi-card" onClick={() => history.push('/tabs/tareas')}>
                <div className="db-kpi-info">
                  <span className="db-kpi-label">Proyectos</span>
                  <p className="db-kpi-value">{data.proyectosActivos}</p>
                  <span className="db-kpi-desc">Proyectos activos</span>
                </div>
                <div className="db-kpi-icon-wrap">
                  <IonIcon icon={folderOutline} />
                </div>
              </div>

              <div className="db-kpi-card" onClick={() => history.push('/tabs/tareas')}>
                <div className="db-kpi-info">
                  <span className="db-kpi-label">Mis Tareas</span>
                  <p className="db-kpi-value">{data.misTareasPendientes}</p>
                  <span className="db-kpi-desc">Tareas pendientes</span>
                </div>
                <div className="db-kpi-icon-wrap" style={{ color: '#c084fc' }}>
                  <IonIcon icon={clipboardOutline} />
                </div>
              </div>

              <div className="db-kpi-card alert" onClick={() => history.push('/tabs/tareas')}>
                <div className="db-kpi-info">
                  <span className="db-kpi-label">Urgentes</span>
                  <p className="db-kpi-value">{data.vencenPronto}</p>
                  <span className="db-kpi-desc">Vencen esta semana</span>
                </div>
                <div className="db-kpi-icon-wrap">
                  <IonIcon icon={alarmOutline} />
                </div>
              </div>

            </div>

            {/* Layout de Secciones de Detalle */}
            <div className="db-sections-layout">

              {/* Tareas Críticas */}
              <div className="db-box">
                <div className="db-box-header">
                  <h3 className="db-box-title">Tareas Críticas y Altas</h3>
                  <a className="db-box-link" onClick={() => history.push('/tabs/tareas')}>Ver todas</a>
                </div>

                <div className="db-tasks-list">
                  {data.tareasCriticas.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, textAlign: 'center', padding: '10px 0' }}>
                      No tienes tareas críticas pendientes. ¡Buen trabajo!
                    </p>
                  ) : (
                    data.tareasCriticas.map(t => (
                      <div key={t.id} className="db-task-item" onClick={() => history.push('/tabs/tareas')}>
                        <div className="db-task-main">
                          <h4 className="db-task-title">{t.titulo}</h4>
                          <span className="db-task-project">📅 Límite: {formatDeadline(t.fechaLimite)}</span>
                        </div>
                        <div className="db-task-badges">
                          <span className={`badge-prioridad ${t.prioridad.toLowerCase()}`} style={{ fontSize: '9px' }}>
                            {t.prioridad}
                          </span>
                          <span className={`badge-estado ${t.estado.toLowerCase()}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                            {getEstadoLabel(t.estado)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actividad Reciente (Bitácora Auditoría) */}
              <div className="db-box">
                <div className="db-box-header">
                  <h3 className="db-box-title">Actividad Reciente</h3>
                </div>

                <div className="db-timeline">
                  {data.actividadReciente.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, textAlign: 'center', padding: '10px 0' }}>
                      No hay historial de auditoría registrado.
                    </p>
                  ) : (
                    data.actividadReciente.map(log => (
                      <div key={log.id} className="db-timeline-item">
                        <div className="db-timeline-header">
                          <strong>{log.usuarioNombre}</strong> • {formatRelativeTime(log.fecha)}
                        </div>
                        <p className="db-timeline-desc">
                          Cambió el estado de la tarea <strong>{log.tareaTitulo}</strong> a <code>{getEstadoLabel(log.estadoNuevo)}</code>.
                        </p>
                        {log.motivo && <p className="db-timeline-motif">" {log.motivo} "</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
        ) : null}

      </IonContent>
    </IonPage>
  );
};

export default Tab1;

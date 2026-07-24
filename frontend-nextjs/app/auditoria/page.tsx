"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '@/hooks/useAuth';
import { obtenerAuditoria, AuditoriaDTO } from '@/services/auditoriaService';

const ACCION_BADGE: Record<string, string> = {
  CREAR_PROYECTO: 'ws-badge ws-badge-activo',
  EDITAR_PROYECTO: 'ws-badge ws-badge-pausa',
  ELIMINAR_PROYECTO: 'ws-badge ws-badge-cancelada',
  CIERRE_PROYECTO: 'ws-badge ws-badge-finalizado',
  REAPERTURA_PROYECTO: 'ws-badge ws-badge-revision',
  CAMBIAR_ROL: 'ws-badge ws-badge-observada',
  AGREGAR_MIEMBRO: 'ws-badge ws-badge-progreso',
  RETIRAR_MIEMBRO: 'ws-badge ws-badge-pendiente',
};

const ACCION_LABEL: Record<string, string> = {
  CREAR_PROYECTO: 'Crear Proyecto',
  EDITAR_PROYECTO: 'Editar Proyecto',
  ELIMINAR_PROYECTO: 'Eliminar Proyecto',
  CIERRE_PROYECTO: 'Cerrar Proyecto',
  REAPERTURA_PROYECTO: 'Reabrir Proyecto',
  CAMBIAR_ROL: 'Cambiar Rol Global',
  AGREGAR_MIEMBRO: 'Agregar Miembro',
  RETIRAR_MIEMBRO: 'Retirar Miembro',
};

// RF-28 Auditoría del Sistema: Interfaz para visualizar la bitácora completa
export default function AuditoriaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const esAutorizado = user?.rol === 'ADMIN' || user?.rol === 'LIDER';

  const [logs, setLogs] = useState<AuditoriaDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');

  useEffect(() => {
    if (esAutorizado) {
      cargarLogs();
    }
  }, [esAutorizado]);

  const cargarLogs = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerAuditoria();
      setLogs(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'No se pudieron cargar los registros de auditoría.');
    } finally {
      setCargando(false);
    }
  };

  if (!esAutorizado) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div style={{ padding: 24, textAlign: 'center', color: '#ef4444' }}>
            <h2>Acceso Denegado</h2>
            <p>Solo los usuarios con rol de Administrador o Líder pueden visualizar la bitácora de auditoría.</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const logsFiltrados = logs.filter(log => {
    const coincideBusqueda = 
      log.usuarioNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.usuarioCorreo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.detalles?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideAccion = !filtroAccion || log.accion === filtroAccion;

    return coincideBusqueda && coincideAccion;
  });

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="ws-page-header">
          <div>
            <h1 className="ws-page-title">Auditoría del Sistema (RF-28)</h1>
            <p className="ws-page-subtitle">Trazabilidad de eventos críticos globales y acciones administrativas del equipo.</p>
          </div>
          <button className="ws-btn-secondary" onClick={cargarLogs} disabled={cargando}>
            {cargando ? 'Actualizando...' : '🔄 Actualizar'}
          </button>
        </div>

        {/* Filtros */}
        <div className="ws-filters" style={{ marginBottom: 20 }}>
          <div className="ws-search-wrap">
            <span className="ws-search-icon">🔍</span>
            <input
              className="ws-search-input"
              placeholder="Buscar por usuario, correo o detalles..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <select className="ws-select" value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}>
            <option value="">Todas las acciones</option>
            {Object.keys(ACCION_LABEL).map(key => (
              <option key={key} value={key}>{ACCION_LABEL[key]}</option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Tabla de Auditoría */}
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Fecha y Hora</th>
                <th style={{ width: '180px' }}>Usuario</th>
                <th style={{ width: '160px' }}>Acción</th>
                <th>Detalles de la Operación</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={4} className="ws-empty">Cargando bitácora de eventos...</td>
                </tr>
              ) : logsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="ws-empty">No se encontraron registros de auditoría.</td>
                </tr>
              ) : (
                logsFiltrados.map(log => {
                  const badgeClass = ACCION_BADGE[log.accion] || 'ws-badge';
                  const label = ACCION_LABEL[log.accion] || log.accion;

                  return (
                    <tr key={log.id}>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>
                        {new Date(log.fecha).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td>
                        <div style={{ fontWeight: 550 }}>{log.usuarioNombre}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{log.usuarioCorreo}</div>
                      </td>
                      <td>
                        <span className={badgeClass}>{label}</span>
                      </td>
                      <td style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.4 }}>
                        {log.detalles}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

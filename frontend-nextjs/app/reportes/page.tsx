"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { obtenerReportes } from '@/services/reporteService';
import type { ReporteDashboardData } from '@/types/reporte';

const LABEL_ESTADO: Record<string, string> = {
  PENDIENTE:   'Pendiente',
  EN_PROGRESO: 'En progreso',
  BLOQUEADA:   'Bloqueada',
  EN_REVISION: 'En revisión',
  OBSERVADA:   'Observada',
  COMPLETADA:  'Completada',
  CANCELADA:   'Cancelado',
};

const COLORS = {
  PENDIENTE:   '#94a3b8', // Slate 400
  EN_PROGRESO: '#f97316', // Orange 500
  BLOQUEADA:   '#ef4444', // Red 500
  EN_REVISION: '#3b82f6', // Blue 500
  OBSERVADA:   '#a855f7', // Purple 500
  COMPLETADA:  '#10b981', // Emerald 500
  CANCELADA:   '#64748b', // Slate 500
};

// ── COMPONENTE: GRÁFICO DE DONA ──
function DoughnutChart({ data }: { data: { estado: string; cantidad: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const total = data.reduce((sum, item) => sum + item.cantidad, 0);
  if (total === 0) {
    return (
      <div className="rep-empty-state">
        <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
        <p>No hay tareas registradas</p>
      </div>
    );
  }

  // Filtrar estados con cantidad > 0
  const activeSlices = data.filter(d => d.cantidad > 0);

  let accumulatedAngle = -Math.PI / 2; // Empezar en el tope (12 en punto)
  const centerX = 150;
  const centerY = 150;
  const radius = 90;
  const innerRadius = 55;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg width={300} height={300} viewBox="0 0 300 300">
        {activeSlices.map((slice, index) => {
          const percentage = slice.cantidad / total;
          const angleRange = percentage * Math.PI * 2;
          const startAngle = accumulatedAngle;
          const endAngle = startAngle + angleRange;
          accumulatedAngle = endAngle;

          // Si es un solo slice de 100%
          if (percentage >= 0.999) {
            return (
              <circle
                key={slice.estado}
                cx={centerX}
                cy={centerY}
                r={radius - (radius - innerRadius) / 2}
                fill="none"
                stroke={COLORS[slice.estado.toUpperCase() as keyof typeof COLORS] || '#94a3b8'}
                strokeWidth={radius - innerRadius}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
            );
          }

          // Coordenadas exterior
          const x1 = centerX + Math.cos(startAngle) * radius;
          const y1 = centerY + Math.sin(startAngle) * radius;
          const x2 = centerX + Math.cos(endAngle) * radius;
          const y2 = centerY + Math.sin(endAngle) * radius;

          // Coordenadas interior
          const ix1 = centerX + Math.cos(endAngle) * innerRadius;
          const iy1 = centerY + Math.sin(endAngle) * innerRadius;
          const ix2 = centerX + Math.cos(startAngle) * innerRadius;
          const iy2 = centerY + Math.sin(startAngle) * innerRadius;

          const largeArcFlag = angleRange > Math.PI ? 1 : 0;

          const pathData = `
            M ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            L ${ix1} ${iy1}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}
            Z
          `;

          const color = COLORS[slice.estado.toUpperCase() as keyof typeof COLORS] || '#94a3b8';
          const isHovered = hoveredIndex === index;

          return (
            <path
              key={slice.estado}
              d={pathData}
              fill={color}
              stroke="#0d111a"
              strokeWidth={2}
              opacity={hoveredIndex === null || isHovered ? 1 : 0.75}
              transform={isHovered ? `scale(1.03) translate(${-centerX * 0.03}, ${-centerY * 0.03})` : ''}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer', transition: 'all 0.2s', transformOrigin: 'center' }}
            />
          );
        })}
      </svg>

      {/* Info central en el doughnut */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        width: 100
      }}>
        {hoveredIndex !== null ? (
          <>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {LABEL_ESTADO[activeSlices[hoveredIndex].estado.toUpperCase()] || activeSlices[hoveredIndex].estado}
            </span>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {activeSlices[hoveredIndex].cantidad}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>
              {Math.round((activeSlices[hoveredIndex].cantidad / total) * 100)}%
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, display: 'block' }}>TOTAL</span>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {total}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Tareas</span>
          </>
        )}
      </div>
    </div>
  );
}

// ── COMPONENTE: BARRAS HORIZONTALES (PROGRESO) ──
function ProjectProgressChart({ data }: { data: { proyectoNombre: string; porcentajeCompletitud: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="rep-empty-state">
        <div style={{ fontSize: 24, marginBottom: 8 }}>💼</div>
        <p>No hay proyectos activos registrados</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {data.map((proj, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)' }}>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
              {proj.proyectoNombre}
            </span>
            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{proj.porcentajeCompletitud}%</span>
          </div>
          <div style={{
            width: '100%',
            height: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 6,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${proj.porcentajeCompletitud}%`,
              height: '100%',
              background: 'var(--accent-gradient)',
              borderRadius: 6,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── COMPONENTE: RADAR/LINEAS (RENDIMIENTO) ──
function CollaboratorPerformanceChart({ data }: { data: { usuarioNombre: string; resueltasATiempo: number; retrasadas: number }[] }) {
  const [hoveredPoint, setHoveredPoint] = useState<{ collabIndex: number; type: 'tiempo' | 'retraso' } | null>(null);

  if (data.length === 0) {
    return (
      <div className="rep-empty-state">
        <div style={{ fontSize: 24, marginBottom: 8 }}>👥</div>
        <p>No hay colaboradores con tareas registradas</p>
      </div>
    );
  }

  // Dimensiones del SVG
  const width = 600;
  const height = 280;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;

  const maxVal = Math.max(...data.map(c => Math.max(c.resueltasATiempo, c.retrasadas)), 4);
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length === 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return height - paddingBottom - (val / maxVal) * chartHeight;
  };

  // Paths
  const pathTiempo = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.resueltasATiempo)}`).join(' ');
  const pathRetrasadas = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.retrasadas)}`).join(' ');

  const areaTiempo = `${pathTiempo} L ${getX(data.length - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`;
  const areaRetrasadas = `${pathRetrasadas} L ${getX(data.length - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`;

  // Lineas de guia Y
  const yTicks = [];
  const ticksCount = 4;
  for (let i = 0; i <= ticksCount; i++) {
    const val = (maxVal / ticksCount) * i;
    yTicks.push({
      y: getY(val),
      label: Math.round(val)
    });
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: '550px' }}>
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            {/* Grid horizontal */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={tick.y}
                  x2={width - paddingRight}
                  y2={tick.y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={tick.y + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill="var(--text-secondary)"
                  fontFamily="Outfit"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* Areas con relleno */}
            <path d={areaTiempo} fill="rgba(16, 185, 129, 0.04)" />
            <path d={areaRetrasadas} fill="rgba(239, 68, 68, 0.04)" />

            {/* Lineas principales */}
            <path d={pathTiempo} fill="none" stroke="#10b981" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathRetrasadas} fill="none" stroke="#ef4444" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

            {/* Puntos de datos */}
            {data.map((d, i) => {
              const x = getX(i);
              const yT = getY(d.resueltasATiempo);
              const yR = getY(d.retrasadas);

              return (
                <g key={i}>
                  {/* Etiquetas X */}
                  <text
                    x={x}
                    y={height - paddingBottom + 20}
                    textAnchor="middle"
                    fontSize={11.5}
                    fill="var(--text-secondary)"
                    fontFamily="Outfit"
                    fontWeight={500}
                  >
                    {d.usuarioNombre.split(' ')[0]}
                  </text>

                  {/* Interacciones A Tiempo */}
                  <circle
                    cx={x}
                    cy={yT}
                    r={hoveredPoint?.collabIndex === i && hoveredPoint?.type === 'tiempo' ? 6 : 4}
                    fill="#10b981"
                    stroke="#0d111a"
                    strokeWidth={2}
                    onMouseEnter={() => setHoveredPoint({ collabIndex: i, type: 'tiempo' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                  />

                  {/* Interacciones Retrasadas */}
                  <circle
                    cx={x}
                    cy={yR}
                    r={hoveredPoint?.collabIndex === i && hoveredPoint?.type === 'retraso' ? 6 : 4}
                    fill="#ef4444"
                    stroke="#0d111a"
                    strokeWidth={2}
                    onMouseEnter={() => setHoveredPoint({ collabIndex: i, type: 'retraso' })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          A tiempo
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
          Retrasadas
        </div>
      </div>

      {/* Tooltip flotante */}
      {hoveredPoint !== null && (
        <div style={{
          position: 'absolute',
          top: -10,
          right: 10,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          fontFamily: 'Outfit',
          border: '1px solid #1e293b',
          zIndex: 10
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 2 }}>{data[hoveredPoint.collabIndex].usuarioNombre}</div>
          <div>
            {hoveredPoint.type === 'tiempo' ? (
              <span style={{ color: '#34d399' }}>A tiempo: {data[hoveredPoint.collabIndex].resueltasATiempo} tareas</span>
            ) : (
              <span style={{ color: '#f87171' }}>Retrasadas: {data[hoveredPoint.collabIndex].retrasadas} tareas</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──
// RF-20 Carga de Trabajo: Análisis del rendimiento por colaborador (a tiempo vs retrasadas).
// RF-21 Reportes & RF-22 Exportación: Gráficas de completitud, visualización y exportación de reportes ejecutivos en formato CSV y vista de impresión PDF.
export default function ReportesPage() {
  const router = useRouter();
  const [data, setData] = useState<ReporteDashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');
      const reportData = await obtenerReportes();
      setData(reportData);
    } catch (err: any) {
      console.error(err);
      setError('No se pudieron cargar los datos analíticos del reporte.');
    } finally {
      setCargando(false);
    }
  };

  const exportarExcel = () => {
    if (!data) return;

    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "=== RESUMEN EJECUTIVO ===\n";
    csvContent += `Total Tareas,${totalTareas}\n`;
    csvContent += `Tasa de Completitud,${tasaCompletitud}%\n`;
    csvContent += `Eficiencia en Plazos,${eficienciaGlobal}%\n\n`;

    csvContent += "=== DISTRIBUCION DE TAREAS ===\n";
    csvContent += "Estado,Cantidad\n";
    data.distribucionTareas.forEach(item => {
      const label = LABEL_ESTADO[item.estado.toUpperCase()] || item.estado;
      csvContent += `"${label}",${item.cantidad}\n`;
    });
    csvContent += "\n";

    csvContent += "=== PROGRESO DE PROYECTOS ACTIVOS ===\n";
    csvContent += "Proyecto,Porcentaje Completitud (%)\n";
    data.progresoProyectos.forEach(item => {
      csvContent += `"${item.proyectoNombre}",${item.porcentajeCompletitud}\n`;
    });
    csvContent += "\n";

    csvContent += "=== RENDIMIENTO POR COLABORADOR ===\n";
    csvContent += "Colaborador,Tareas a Tiempo,Tareas Retrasadas\n";
    data.rendimientoColaboradores.forEach(item => {
      csvContent += `"${item.usuarioNombre}",${item.resueltasATiempo},${item.retrasadas}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Ejecutivo_WorkSync_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    window.print();
  };

  // Cálculos agregados
  const totalTareas = data?.distribucionTareas.reduce((sum, item) => sum + item.cantidad, 0) ?? 0;
  const completadas = data?.distribucionTareas.find(d => d.estado.toUpperCase() === 'COMPLETADA')?.cantidad ?? 0;
  const tasaCompletitud = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0;

  const totalCompletadasColaboradores = data?.rendimientoColaboradores.reduce((sum, item) => sum + item.resueltasATiempo + item.retrasadas, 0) ?? 0;
  const totalATiempoColaboradores = data?.rendimientoColaboradores.reduce((sum, item) => sum + item.resueltasATiempo, 0) ?? 0;
  const eficienciaGlobal = totalCompletadasColaboradores > 0 ? Math.round((totalATiempoColaboradores / totalCompletadasColaboradores) * 100) : 100;

  return (
    <ProtectedRoute>
      <AppLayout>
        <style>{`
          .rep-header {
            margin-bottom: 28px;
          }
          .rep-title {
            font-size: 26px;
            font-weight: 700;
            background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 4px;
            letter-spacing: -0.5px;
          }
          .rep-subtitle {
            font-size: 14px;
            color: var(--text-secondary);
          }

          /* KPIs resumen */
          .rep-kpi-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 32px;
          }
          @media (min-width: 768px) {
            .rep-kpi-row {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          .rep-kpi-card {
            background: var(--bg-white);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 20px 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: var(--shadow-sm);
          }
          .rep-kpi-icon {
            width: 44px;
            height: 44px;
            border-radius: var(--radius-sm);
            background-color: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border);
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--accent-secondary);
          }
          .rep-kpi-data {
            display: flex;
            flex-direction: column;
          }
          .rep-kpi-val {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1.2;
          }
          .rep-kpi-label {
            font-size: 12.5px;
            color: var(--text-secondary);
            font-weight: 500;
          }

          /* Grid de Gráficos */
          .rep-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            margin-bottom: 24px;
          }
          @media (min-width: 1024px) {
            .rep-grid-1 {
              grid-template-columns: 2fr 3fr;
            }
            .rep-grid-2 {
              grid-template-columns: 1fr;
            }
          }

          .rep-chart-card {
            background: var(--bg-white);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 24px;
            box-shadow: var(--shadow-md);
            display: flex;
            flex-direction: column;
          }
          .rep-chart-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 6px;
          }
          .rep-chart-desc {
            font-size: 12.5px;
            color: var(--text-muted);
            margin-bottom: 24px;
          }
          
          /* Empty/Loading States */
          .rep-empty-state {
            text-align: center;
            padding: 48px 16px;
            color: var(--text-muted);
            font-size: 13.5px;
          }
          .rep-loader-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .rep-loader {
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid var(--accent-secondary);
            border-radius: 50%;
            width: 36px;
            height: 36px;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media print {
            .ws-sidebar, .ws-header, .rep-export-panel, .rep-header .rep-subtitle {
              display: none !important;
            }
            .ws-main {
              margin-left: 0 !important;
              padding: 0 !important;
            }
            .ws-content {
              padding: 0 !important;
            }
            body {
              background-color: #ffffff !important;
              color: #000000 !important;
            }
            .rep-kpi-card, .rep-chart-card {
              border: 1px solid #cbd5e1 !important;
              box-shadow: none !important;
              page-break-inside: avoid;
            }
            .rep-grid-1 {
              grid-template-columns: 1fr 1fr !important;
              gap: 20px !important;
            }
            .rep-kpi-row {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 15px !important;
            }
          }
        `}</style>

        <div className="rep-header">
          <h1 className="rep-title">Módulo de Reportes</h1>
          <p className="rep-subtitle">Analítica visual sobre la productividad y el rendimiento de tus proyectos.</p>
        </div>

        {data && (
          <div className="rep-export-panel" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginBottom: 24,
            background: 'var(--bg-white)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '12px 24px',
            alignItems: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: 'auto' }}>
              📄 Exportar Resumen Ejecutivo:
            </span>
            <button 
              className="ws-btn-secondary" 
              onClick={exportarExcel}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '8px 16px', margin: 0 }}
            >
              🟢 Excel (CSV)
            </button>
            <button 
              className="ws-btn-primary" 
              onClick={exportarPDF}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '8px 16px', margin: 0, backgroundColor: '#0284c7' }}
            >
              🔴 PDF (Imprimir)
            </button>
          </div>
        )}

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
              onClick={cargarDatos}
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
          <div className="rep-loader-wrap">
            <div className="rep-loader" />
          </div>
        ) : data ? (
          <>
            {/* ROW DE METRICAS CLAVE */}
            <div className="rep-kpi-row">
              <div className="rep-kpi-card">
                <div className="rep-kpi-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>📊</div>
                <div className="rep-kpi-data">
                  <span className="rep-kpi-val">{totalTareas}</span>
                  <span className="rep-kpi-label">Tareas Registradas</span>
                </div>
              </div>
              <div className="rep-kpi-card">
                <div className="rep-kpi-icon" style={{ backgroundColor: 'rgba(52, 211, 153, 0.12)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>📈</div>
                <div className="rep-kpi-data">
                  <span className="rep-kpi-val">{tasaCompletitud}%</span>
                  <span className="rep-kpi-label">Tasa de Completitud</span>
                </div>
              </div>
              <div className="rep-kpi-card">
                <div className="rep-kpi-icon" style={{ backgroundColor: 'rgba(248, 113, 113, 0.12)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)' }}>⚡</div>
                <div className="rep-kpi-data">
                  <span className="rep-kpi-val">{eficienciaGlobal}%</span>
                  <span className="rep-kpi-label">Eficiencia en Plazos</span>
                </div>
              </div>
            </div>

            {/* GRID DE GRAFICOS */}
            <div className="rep-grid rep-grid-1">
              {/* Grafico de Dona */}
              <div className="rep-chart-card">
                <h3 className="rep-chart-title">Distribución de Tareas</h3>
                <p className="rep-chart-desc">Proporción de tareas según su estado de avance actual.</p>
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DoughnutChart data={data.distribucionTareas} />
                </div>
              </div>

              {/* Grafico de Barras de Proyectos */}
              <div className="rep-chart-card">
                <h3 className="rep-chart-title">Progreso de Proyectos Activos</h3>
                <p className="rep-chart-desc">Porcentaje de completitud en base a tareas resueltas por proyecto.</p>
                <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <ProjectProgressChart data={data.progresoProyectos} />
                </div>
              </div>
            </div>

            <div className="rep-grid rep-grid-2">
              {/* Grafico de Radar/Líneas de Rendimiento */}
              <div className="rep-chart-card">
                <h3 className="rep-chart-title">Rendimiento por Colaborador</h3>
                <p className="rep-chart-desc">Tareas entregadas a tiempo frente a tareas retrasadas por usuario responsable.</p>
                <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <CollaboratorPerformanceChart data={data.rendimientoColaboradores || []} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="ws-empty">
            <p>No se encontraron datos analíticos.</p>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}

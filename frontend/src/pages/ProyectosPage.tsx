import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Proyecto } from '../types/proyecto';
import { buscarProyectos, crearProyecto, editarProyecto } from '../services/proyectoService';
import AppLayout from '../components/AppLayout';

const ESTADOS = ['ACTIVO', 'EN_PAUSA', 'FINALIZADO'];

const BADGE: Record<string, string> = {
  ACTIVO: 'ws-badge ws-badge-activo',
  EN_PAUSA: 'ws-badge ws-badge-pausa',
  FINALIZADO: 'ws-badge ws-badge-finalizado',
};

const LABEL: Record<string, string> = {
  ACTIVO: 'Activo',
  EN_PAUSA: 'En pausa',
  FINALIZADO: 'Finalizado',
};

interface FormData {
  nombre: string;
  descripcion: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

const FORM_VACIO: FormData = { nombre: '', descripcion: '', estado: 'ACTIVO', fechaInicio: '', fechaFin: '' };

export default function ProyectosPage() {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Proyecto | null>(null);
  const [form, setForm] = useState<FormData>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await buscarProyectos({});
      setProyectos(data.content);
    } catch {
      setError('No se pudieron cargar los proyectos.');
    } finally {
      setCargando(false);
    }
  };

  const proyectosFiltrados = proyectos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = !filtroEstado || p.estado === filtroEstado;
    return coincideNombre && coincideEstado;
  });

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setModalAbierto(true);
  };

  const abrirEditar = (p: Proyecto, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditando(p);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      estado: p.estado,
      fechaInicio: p.fechaInicio ?? '',
      fechaFin: p.fechaFin ?? '',
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => { setModalAbierto(false); setEditando(null); };

  const handleForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const guardar = async () => {
    if (!form.nombre.trim()) return;
    setGuardando(true);
    try {
      if (editando) {
        const actualizado = await editarProyecto(editando.id, form);
        setProyectos(prev => prev.map(p => p.id === editando.id ? actualizado : p));
      } else {
        const nuevo = await crearProyecto(form);
        setProyectos(prev => [...prev, nuevo]);
      }
      cerrarModal();
    } catch {
      setError('Error al guardar el proyecto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AppLayout>
      <div className="ws-page-header">
        <div>
          <h1 className="ws-page-title">Mis Proyectos</h1>
          <p className="ws-page-subtitle">Gestiona y monitorea todos tus proyectos</p>
        </div>
        <button className="ws-btn-primary" onClick={abrirCrear}>
          + Nuevo Proyecto
        </button>
      </div>

      {/* Filtros */}
      <div className="ws-filters">
        <div className="ws-search-wrap">
          <span className="ws-search-icon">🔍</span>
          <input
            className="ws-search-input"
            placeholder="Buscar proyectos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <select className="ws-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{LABEL[e]}</option>)}
        </select>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: 12, fontSize: 14 }}>{error}</div>}

      {/* Tabla */}
      <div className="ws-table-wrap">
        <table className="ws-table">
          <thead>
            <tr>
              <th>Nombre del proyecto</th>
              <th>Estado</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={5} className="ws-empty">Cargando proyectos...</td></tr>
            ) : proyectosFiltrados.length === 0 ? (
              <tr><td colSpan={5} className="ws-empty">No se encontraron proyectos.</td></tr>
            ) : (
              proyectosFiltrados.map(p => (
                <tr
                  key={p.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/proyectos/${p.id}/tareas`)}
                >
                  <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                  <td><span className={BADGE[p.estado] ?? 'ws-badge'}>{LABEL[p.estado] ?? p.estado}</span></td>
                  <td>{p.fechaInicio ?? '—'}</td>
                  <td>{p.fechaFin ?? '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="ws-btn-icon" title="Ver" onClick={() => navigate(`/proyectos/${p.id}/tareas`)}>👁</button>
                      <button className="ws-btn-icon" title="Editar" onClick={e => abrirEditar(p, e)}>✏️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="ws-pagination">
          Mostrando {proyectosFiltrados.length} de {proyectos.length} proyectos
        </div>
      </div>

      {/* Modal Crear / Editar */}
      {modalAbierto && (
        <div className="ws-modal-overlay" onClick={cerrarModal}>
          <div className="ws-modal" onClick={e => e.stopPropagation()}>
            <div className="ws-modal-header">
              <h2 className="ws-modal-title">{editando ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
              <button className="ws-modal-close" onClick={cerrarModal}>✕</button>
            </div>

            <div className="ws-field">
              <label>Nombre del proyecto</label>
              <input name="nombre" value={form.nombre} onChange={handleForm} placeholder="Ej. Nuevo Proyecto" />
            </div>
            <div className="ws-field">
              <label>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleForm} placeholder="Describe el proyecto..." />
            </div>
            <div className="ws-field ws-field-row">
              <div>
                <label>Fecha inicio</label>
                <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleForm} />
              </div>
              <div>
                <label>Fecha fin</label>
                <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleForm} />
              </div>
            </div>
            <div className="ws-field">
              <label>Estado</label>
              <select name="estado" value={form.estado} onChange={handleForm}>
                {ESTADOS.map(e => <option key={e} value={e}>{LABEL[e]}</option>)}
              </select>
            </div>

            <div className="ws-modal-footer">
              <button className="ws-btn-secondary" onClick={cerrarModal}>Cancelar</button>
              <button className="ws-btn-primary" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
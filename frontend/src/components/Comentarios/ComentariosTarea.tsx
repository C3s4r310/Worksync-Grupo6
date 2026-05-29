import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Reaccion {
  thumbsUp: number;
  reaccionado: boolean;
}

interface Comentario {
  id: number;
  usuarioId: number;
  autorNombre: string;
  autorRol?: string;
  contenido: string;
  fechaCreacion: string;
  editado?: boolean;
  reacciones: Reaccion;
}

interface Props {
  tareaId: number;
  usuarioActualId: number;
  usuarioActualNombre: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PALETTES = [
  { bg: '#DEEBFF', color: '#0747A6' }, // Azul
  { bg: '#E3FCEF', color: '#006644' }, // Verde
  { bg: '#FFFAE6', color: '#FF8B00' }, // Amarillo
  { bg: '#FFEBE6', color: '#BF2600' }, // Rojo
  { bg: '#EAE6FF', color: '#403294' }, // Morado
  { bg: '#DFE1E6', color: '#42526E' }, // Gris
];

const paletteCache: Record<string, typeof PALETTES[0]> = {};
function paletteFor(nombre: string) {
  if (!paletteCache[nombre]) {
    const idx = Object.keys(paletteCache).length % PALETTES.length;
    paletteCache[nombre] = PALETTES[idx];
  }
  return paletteCache[nombre];
}

function iniciales(nombre: string) {
  return nombre.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
}

function relTime(iso: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000)      return 'ahora mismo';
  if (diff < 3_600_000)   return `hace ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000)  return `hace ${Math.floor(diff / 3_600_000)}h`;
  if (diff < 604_800_000) return `hace ${Math.floor(diff / 86_400_000)} días`;
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({ nombre, size = 38 }: { nombre: string; size?: number }) => {
  const { bg, color } = paletteFor(nombre);
  return (
    <div style={{
      width: size, height: size, minWidth: size,
      borderRadius: '50%', background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, userSelect: 'none', flexShrink: 0,
      boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)'
    }}>
      {iniciales(nombre)}
    </div>
  );
};

// ─── Editor de texto (nuevo o inline) ────────────────────────────────────────

interface EditorProps {
  initialValue?: string;
  placeholder?: string;
  onGuardar: (texto: string) => void;
  onCancelar: () => void;
  compact?: boolean;
}

const Editor: React.FC<EditorProps> = ({ initialValue = '', placeholder = 'Escribe tu actualización aquí...', onGuardar, onCancelar, compact }) => {
  const [texto, setTexto] = useState(initialValue);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { taRef.current?.focus(); }, []);

  const fmt = (open: string, close: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.slice(s, e) || 'texto';
    const nuevo = ta.value.slice(0, s) + open + sel + close + ta.value.slice(e);
    setTexto(nuevo);
    setTimeout(() => ta.focus(), 0);
  };

  const insertAt = () => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const nuevo = ta.value.slice(0, s) + '@' + ta.value.slice(s);
    setTexto(nuevo);
    setTimeout(() => { if (ta) { ta.selectionStart = ta.selectionEnd = s + 1; ta.focus(); } }, 0);
  };

  return (
    <div style={e.editorWrapper}>
      {/* Toolbar */}
      {!compact && (
        <div style={e.toolbar}>
          <button style={e.tb} title="Negrita" onClick={() => fmt('**', '**')}><b>B</b></button>
          <button style={e.tb} title="Cursiva" onClick={() => fmt('_', '_')}><i>I</i></button>
          <button style={e.tb} title="Código" onClick={() => fmt('`', '`')} >
            <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{'</>'}</span>
          </button>
          <div style={e.tbSep} />
          <button style={e.tb} title="Mencionar" onClick={insertAt}>@</button>
        </div>
      )}

      <textarea
        ref={taRef}
        value={texto}
        onChange={ev => setTexto(ev.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        style={{
          ...e.ta,
          borderRadius: compact ? 8 : '0 0 8px 8px',
          borderTop: compact ? '1px solid #DFE1E6' : 'none',
        }}
        onKeyDown={ev => {
          if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey) && texto.trim()) onGuardar(texto.trim());
          if (ev.key === 'Escape') onCancelar();
        }}
      />

      <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
        <button
          style={texto.trim() ? e.btnPrimary : e.btnDisabled}
          disabled={!texto.trim()}
          onClick={() => onGuardar(texto.trim())}
        >
          Guardar
        </button>
        <button style={e.btnGhost} onClick={onCancelar}>Cancelar</button>
        <span style={e.tip}>Ctrl+Enter · Esc para cancelar</span>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const ComentariosTarea: React.FC<Props> = ({ tareaId, usuarioActualId, usuarioActualNombre }) => {
  const [comentarios, setComentarios]     = useState<Comentario[]>([]);
  const [cargando, setCargando]           = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [editandoId, setEditandoId]       = useState<number | null>(null);
  const [editorAbierto, setEditorAbierto] = useState(false);
  const [orden, setOrden]                 = useState<'nuevo' | 'antiguo'>('nuevo');

  useEffect(() => { cargar(); }, [tareaId]);

  const cargar = async () => {
    setCargando(true); setError(null);
    try {
      const { data } = await axios.get<Comentario[]>(
        `http://localhost:8080/api/comentarios/tarea/${tareaId}`
      );
      setComentarios(data);
    } catch {
      setError('No se pudieron cargar los comentarios. Verifica la conexión.');
    } finally {
      setCargando(false);
    }
  };

  const crear = async (contenido: string) => {
    try {
      await axios.post(`http://localhost:8080/api/comentarios/tarea/${tareaId}`, {
        usuarioId: usuarioActualId, contenido,
      });
      setEditorAbierto(false);
      await cargar();
    } catch { setError('Error al guardar el comentario.'); }
  };

  const editar = async (id: number, contenido: string) => {
    try {
      await axios.put(`http://localhost:8080/api/comentarios/${id}`, {
        usuarioId: usuarioActualId, contenido,
      });
      setEditandoId(null);
      await cargar();
    } catch { setError('Error al editar el comentario.'); }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este comentario? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`http://localhost:8080/api/comentarios/${id}`);
      await cargar();
    } catch { setError('Error al eliminar el comentario.'); }
  };

  const toggleLike = async (id: number) => {
    setComentarios(prev => prev.map(c => {
      if (c.id !== id) return c;
      const reaccionado = !c.reacciones?.reaccionado;
      return { ...c, reacciones: { reaccionado, thumbsUp: (c.reacciones?.thumbsUp || 0) + (reaccionado ? 1 : -1) } };
    }));
  };

  const ordenados = [...comentarios].sort((a, b) => {
    const da = new Date(a.fechaCreacion).getTime();
    const db = new Date(b.fechaCreacion).getTime();
    return orden === 'nuevo' ? db - da : da - db;
  });

  return (
    <div style={e.contenedor}>

      {/* Encabezado */}
      <div style={e.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={e.iconBox}>💬</div>
          <span style={e.titulo}>Conversación</span>
          <span style={e.badge}>{comentarios.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, background: '#F4F5F7', padding: 4, borderRadius: 6 }}>
          {(['nuevo', 'antiguo'] as const).map(o => (
            <button
              key={o}
              style={{ ...e.pillBtn, ...(orden === o ? e.pillActive : {}) }}
              onClick={() => setOrden(o)}
            >
              {o === 'nuevo' ? 'Recientes' : 'Antiguos'}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={e.errorBanner}>
          <span style={{ fontWeight: 600 }}>⚠ {error}</span>
          <button style={e.errorClose} onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Título de Lista */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#5E6C84', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Historial de Actividad
      </div>

      {/* Lista */}
      {cargando ? (
        <div style={e.loadingState}>Cargando actividad…</div>
      ) : ordenados.length === 0 ? (
        <div style={e.empty}>
          <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>📝</div>
          <p style={{ margin: 0, fontWeight: 500 }}>Aún no hay comentarios en este ticket.</p>
          <span style={{ fontSize: 12, color: '#7A869A', marginTop: 4, display: 'block' }}>Sé el primero en iniciar la conversación.</span>
        </div>
      ) : (
        <div style={e.listaContainer}>
          {ordenados.map(c => (
            <div key={c.id} style={e.card}>
              <div style={{ display: 'flex', gap: 16 }}>
                <Avatar nombre={c.autorNombre || `Usuario ${c.usuarioId}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  
                  {/* Meta Datos de la Tarjeta */}
                  <div style={e.meta}>
                    <span style={e.autor}>{c.autorNombre || `Usuario ${c.usuarioId}`}</span>
                    {c.autorRol && <span style={e.rol}>{c.autorRol}</span>}
                    <span style={e.ts} title={c.fechaCreacion}>{relTime(c.fechaCreacion)}</span>
                    {c.editado && <em style={{ fontSize: 12, color: '#7A869A' }}>(editado)</em>}
                    
                    {/* Botones de Acción integrados en la esquina superior derecha */}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      {c.usuarioId === usuarioActualId && (
                        <>
                          <button style={e.iconBtn} title="Editar" onClick={() => setEditandoId(c.id)}>✎</button>
                          <button style={e.iconBtn} title="Eliminar" onClick={() => eliminar(c.id)}>🗑</button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contenido o editor inline */}
                  {editandoId === c.id ? (
                    <div style={{ marginTop: 12 }}>
                      <Editor
                        compact
                        initialValue={c.contenido}
                        onGuardar={txt => editar(c.id, txt)}
                        onCancelar={() => setEditandoId(null)}
                      />
                    </div>
                  ) : (
                    <>
                      <div style={e.textoCaja}>
                        <p style={e.texto}>{c.contenido}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                        <button
                          style={{ ...e.reactBtn, ...(c.reacciones?.reaccionado ? e.reactActive : {}) }}
                          onClick={() => toggleLike(c.id)}
                        >
                          👍 {c.reacciones?.thumbsUp || 0}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Separador elegante */}
      <div style={e.dividerWrapper}>
        <hr style={e.divider} />
      </div>

      {/* Sección de Nuevo Comentario Inferior */}
      <div style={{ display: 'flex', gap: 16, background: '#FAFBFC', padding: 20, borderRadius: 12, border: '1px dashed #DFE1E6' }}>
        <Avatar nombre={usuarioActualNombre} />
        <div style={{ flex: 1 }}>
          {editorAbierto ? (
            <Editor
              onGuardar={crear}
              onCancelar={() => setEditorAbierto(false)}
            />
          ) : (
            <div style={e.placeholderBox} onClick={() => setEditorAbierto(true)}>
              Añade una actualización... usa @ para mencionar a tu equipo
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

// ─── Estilos "Premium" (Jira Cloud V2) ──────────────────────────────────────

const e: Record<string, React.CSSProperties> = {
  contenedor: {
    maxWidth: 780, width: '100%', margin: '0 auto',
    padding: '2rem',
    background: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14, color: '#172B4D',
    boxShadow: '0 8px 30px rgba(9, 30, 66, 0.04)', // Sombra principal suave
    borderRadius: 16, // Bordes más amigables
    border: '1px solid #DFE1E6'
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #F4F5F7' },
  iconBox: { background: '#DEEBFF', color: '#0052CC', padding: '8px 10px', borderRadius: 8, fontSize: 16 },
  titulo: { fontSize: 18, fontWeight: 700, color: '#172B4D', letterSpacing: '-0.3px' },
  badge: { background: '#DFE1E6', color: '#42526E', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 12 },
  pillBtn: { background: 'transparent', border: 'none', color: '#5E6C84', fontSize: 13, padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontWeight: 600, transition: '0.2s' },
  pillActive: { background: '#FFFFFF', color: '#0052CC', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  errorBanner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFEBE6', color: '#BF2600', borderRadius: 8, padding: '14px 20px', fontSize: 14, marginBottom: 20, boxShadow: '0 2px 4px rgba(191, 38, 0, 0.1)' },
  errorClose: { background: 'none', border: 'none', color: '#BF2600', cursor: 'pointer', fontSize: 16, padding: 0 },
  
  // Lista y Tarjetas (Cards)
  listaContainer: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  card: { 
    background: '#FFFFFF', 
    border: '1px solid #DFE1E6', 
    borderRadius: 12, 
    padding: '20px',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.02)', // Efecto elevación
    transition: 'box-shadow 0.2s ease',
  },
  meta: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' as const },
  autor: { fontWeight: 600, fontSize: 14, color: '#172B4D', cursor: 'pointer' },
  rol: { fontSize: 11, background: '#EAE6FF', color: '#403294', padding: '2px 8px', borderRadius: 12, fontWeight: 700 },
  ts: { fontSize: 12, color: '#7A869A', fontWeight: 500 },
  textoCaja: { marginTop: 4 },
  texto: { fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' as const, color: '#172B4D' },
  
  // Botones
  iconBtn: { background: '#F4F5F7', border: 'none', color: '#5E6C84', width: 30, height: 30, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold' },
  reactBtn: { background: '#FAFBFC', border: '1px solid #DFE1E6', color: '#5E6C84', fontSize: 13, padding: '4px 12px', borderRadius: 16, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 2px rgba(9,30,66,0.04)' },
  reactActive: { background: '#DEEBFF', borderColor: '#B3D4FF', color: '#0052CC' },
  
  // Utils
  dividerWrapper: { padding: '10px 0 20px 0' },
  divider: { border: 'none', borderTop: '1px solid #DFE1E6' },
  loadingState: { padding: '2rem', textAlign: 'center' as const, color: '#5E6C84', fontSize: 14, fontWeight: 500 },
  empty: { padding: '3rem', textAlign: 'center' as const, border: '2px dashed #DFE1E6', borderRadius: 12, color: '#5E6C84', fontSize: 14, marginBottom: '2rem', background: '#FAFBFC' },
  
  // Editor Mejorado
  editorWrapper: { flex: 1, display: 'flex', flexDirection: 'column' },
  toolbar: { display: 'flex', gap: 4, alignItems: 'center', padding: '8px 12px', background: '#FAFBFC', border: '1px solid #DFE1E6', borderBottom: 'none', borderRadius: '8px 8px 0 0' },
  tb: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 4, fontSize: 14, color: '#42526E', fontWeight: 600 },
  tbSep: { width: 1, background: '#DFE1E6', height: 18, margin: '0 6px' },
  ta: { width: '100%', boxSizing: 'border-box' as const, border: '1px solid #DFE1E6', padding: '14px 16px', fontSize: 14, lineHeight: 1.6, background: '#FFFFFF', color: '#172B4D', resize: 'vertical' as const, outline: 'none', fontFamily: 'inherit', minHeight: 90, boxShadow: 'inset 0 1px 3px rgba(9,30,66,0.03)' },
  placeholderBox: { width: '100%', border: '1px solid #DFE1E6', borderRadius: 8, padding: '14px 16px', fontSize: 14, color: '#7A869A', cursor: 'text', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(9,30,66,0.04)' },
  btnPrimary: { background: '#0052CC', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 82, 204, 0.15)' },
  btnDisabled: { background: '#091E420A', color: '#A5ADBA', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'not-allowed' },
  btnGhost: { background: 'transparent', border: 'none', color: '#42526E', fontSize: 14, cursor: 'pointer', padding: '8px 16px', borderRadius: 6, fontWeight: 600 },
  tip: { fontSize: 12, color: '#7A869A', marginLeft: 'auto', fontWeight: 500 },
};

export default ComentariosTarea;
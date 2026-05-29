import { useEffect, useState } from 'react';
import type { Proyecto, FiltrosProyecto } from '../types/proyecto';
import { buscarProyectos } from '../services/proyectoService';

export default function ProyectosPage() {
  const [filtros, setFiltros] = useState<FiltrosProyecto>({});
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosProyecto>({});
  
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Se ejecuta al cargar la página o cuando el usuario hace clic en "Filtrar"
  useEffect(() => {
    cargarProyectos();
  }, [filtrosAplicados]);

  const cargarProyectos = async () => {
    try {
      setCargando(true);
      setError('');
      // Llamamos a tu backend mágico
      const dataPage = await buscarProyectos(filtrosAplicados);
      setProyectos(dataPage.content);
    } catch (e) {
      setError('No se pudieron cargar los proyectos. Verifica la conexión.');
    } finally {
      setCargando(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = () => {
    setFiltrosAplicados(filtros);
  };

  // Función auxiliar para darle color al estado del proyecto (Usabilidad)
  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return { bg: '#e8f5e9', text: '#4caf50' };
      case 'EN_PAUSA': return { bg: '#fff3e0', text: '#ff9800' };
      case 'FINALIZADO': return { bg: '#e3f2fd', text: '#2196f3' };
      default: return { bg: '#f5f5f5', text: '#666' };
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '8px' }}>
          Directorio de Proyectos
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Busca y filtra los proyectos de la organización.
        </p>
      </header>

      {/* RNF-03: Panel de Filtros Intuitivo */}
      <section style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '200px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Buscar palabra clave</label>
          <input 
            type="text" 
            name="palabraClave"
            placeholder="Ej. Rediseño, API, Migración..."
            onChange={handleInputChange}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Estado</label>
          <select name="estado" onChange={handleInputChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="EN_PAUSA">En Pausa</option>
            <option value="FINALIZADO">Finalizado</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Fecha de Inicio (desde)</label>
          <input 
            type="date" 
            name="fechaInicio"
            onChange={handleInputChange}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button 
          onClick={aplicarFiltros}
          style={{
            padding: '10px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            height: '40px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          Filtrar Proyectos
        </button>
      </section>

      {/* Resultados de la búsqueda */}
      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
      
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Cargando proyectos...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {proyectos.length === 0 ? (
            <p style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              No se encontraron proyectos con esos filtros.
            </p>
          ) : (
            proyectos.map(proyecto => {
              const color = getColorEstado(proyecto.estado);
              return (
                <div key={proyecto.id} style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${color.text}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>{proyecto.nombre}</h3>
                    <span style={{ 
                      backgroundColor: color.bg, 
                      color: color.text, 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {proyecto.estado}
                    </span>
                  </div>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', minHeight: '40px' }}>
                    {proyecto.descripcion || 'Sin descripción'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
                    <span>Inicio: {proyecto.fechaInicio || 'N/A'}</span>
                    <span>Fin: {proyecto.fechaFin || 'N/A'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import TareaBoard from '../components/tareas/TareaBoard';
import type { FiltrosTarea } from '../types/tarea';

interface TareasPageProps {
  proyectoId?: number;
  nombreProyecto?: string;
}

export default function TareasPage({
  proyectoId = 1,
  nombreProyecto = 'Proyecto de prueba',
}: TareasPageProps) {
  
  // Estado temporal: guarda lo que el usuario escribe en tiempo real
  const [filtros, setFiltros] = useState<FiltrosTarea>({});
  
  // Estado oficial: guarda los filtros solo cuando se hace clic en "Buscar"
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosTarea>({});

  // Manejador de cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Función que se ejecuta al darle al botón de buscar
  const aplicarFiltros = () => {
    // Al pasar los filtros al estado oficial, React actualizará el TareaBoard
    setFiltrosAplicados(filtros);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '8px' }}>
          Gestión de Tareas - {nombreProyecto}
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Utiliza los filtros para encontrar rápidamente las tareas de tu equipo.
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
            placeholder="Ej. Diseño, Base de datos..."
            onChange={handleInputChange}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Estado</label>
          <select name="estado" onChange={handleInputChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROGRESO">En Progreso</option>
            <option value="COMPLETADO">Completado</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>Prioridad</label>
          <select name="prioridad" onChange={handleInputChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="">Todas</option>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica</option>
          </select>
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
          Filtrar Resultados
        </button>
      </section>

      {/* Tablero de Jeremy: Ahora recibe los filtros como "props" */}
      <TareaBoard
        proyectoId={proyectoId}
        nombreProyecto={nombreProyecto}
        filtros={filtrosAplicados}
      />
    </div>
  );
}
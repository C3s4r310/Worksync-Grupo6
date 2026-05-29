import React from 'react';
import ComentariosTarea from './components/Comentarios/ComentariosTarea';
import './App.css'; 

function App() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] py-10">
      <h1 className="text-2xl font-bold text-center text-[#172B4D] mb-8">
        Tablero de WorkSync
      </h1>

      <ComentariosTarea
        tareaId={123}
        usuarioActualId={1}
        usuarioActualNombre="Juan Martínez"
      />
    </div>
  );
}

export default App;
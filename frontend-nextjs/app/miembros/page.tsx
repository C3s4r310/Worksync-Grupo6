"use client";

import { useEffect, useState, useRef } from 'react';
import useAuth from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { obtenerContactos, obtenerHistorial, enviarMensaje } from '@/services/mensajeService';
import type { ProyectoMiembrosChat, MiembroChat, Mensaje } from '@/types/mensaje';

export default function MiembrosChatPage() {
  const { user } = useAuth();
  
  const [proyectosChat, setProyectosChat] = useState<ProyectoMiembrosChat[]>([]);
  const [contactoSeleccionado, setContactoSeleccionado] = useState<MiembroChat | null>(null);
  const [proyectoActivoId, setProyectoActivoId] = useState<number | undefined>(undefined);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [myAvatar, setMyAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const savedAvatar = localStorage.getItem(`ws_user_avatar_${user.id}`);
      if (savedAvatar) {
        setMyAvatar(savedAvatar);
      }
    }
  }, [user]);
  
  const [cargandoContactos, setCargandoContactos] = useState(true);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [error, setError] = useState('');

  // Control de colapso de proyectos
  const [proyectosExpandidos, setProyectosExpandidos] = useState<Record<number, boolean>>({});
  
  // Responsive: En móvil, controla si se muestra el hilo de chat o la barra lateral
  const [verChatMovil, setVerChatMovil] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Helper para hacer scroll al fondo
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Cargar contactos iniciales y configurar la expansión por defecto
  useEffect(() => {
    const cargarContactosIniciales = async () => {
      try {
        setCargandoContactos(true);
        const data = await obtenerContactos();
        setProyectosChat(data);
        
        // Expandir todos los proyectos inicialmente
        const expandidos: Record<number, boolean> = {};
        data.forEach(p => {
          expandidos[p.id] = true;
        });
        setProyectosExpandidos(expandidos);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la lista de contactos.');
      } finally {
        setCargandoContactos(false);
      }
    };

    cargarContactosIniciales();
  }, []);

  // Polling de 4 segundos para actualizar contactos y chat actual
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await obtenerContactos();
        setProyectosChat(data);

        // Si hay un contacto seleccionado, traer el historial en segundo plano
        if (contactoSeleccionado) {
          const historialData = await obtenerHistorial(contactoSeleccionado.id);
          setMensajes(historialData);
        }
      } catch (err) {
        console.error('Error en sondeo periódico:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [contactoSeleccionado]);

  // Scroll automático cuando cambian los mensajes
  useEffect(() => {
    if (mensajes.length > 0) {
      scrollToBottom('smooth');
    }
  }, [mensajes]);

  // Scroll instantáneo al cambiar de conversación
  useEffect(() => {
    if (contactoSeleccionado) {
      scrollToBottom('auto');
    }
  }, [contactoSeleccionado]);

  // Selección de contacto
  const seleccionarContacto = async (contacto: MiembroChat, proyectoId: number) => {
    setContactoSeleccionado(contacto);
    setProyectoActivoId(proyectoId);
    setMensajes([]);
    setNuevoMensaje('');
    setVerChatMovil(true);
    setCargandoHistorial(true);
    
    try {
      const historialData = await obtenerHistorial(contacto.id);
      setMensajes(historialData);
    } catch (err: any) {
      setError(err.message || 'Error al obtener el historial de chat.');
    } finally {
      setCargandoHistorial(false);
    }
  };

  // Enviar mensaje
  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !contactoSeleccionado) return;

    const texto = nuevoMensaje.trim();
    setNuevoMensaje(''); // Feedback instantáneo en el input

    try {
      const msg = await enviarMensaje(contactoSeleccionado.id, texto, proyectoActivoId);
      setMensajes(prev => [...prev, msg]);
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el mensaje.');
    }
  };

  // Alternar colapso de proyectos
  const toggleProyecto = (proyectoId: number) => {
    setProyectosExpandidos(prev => ({
      ...prev,
      [proyectoId]: !prev[proyectoId]
    }));
  };

  // Calcular disponibilidad (online si última conexión < 5 minutos)
  const obtenerDisponibilidad = (ultimaConexionStr?: string) => {
    if (!ultimaConexionStr) return { online: false, texto: 'Desconectado' };
    
    const ultimaConexion = new Date(ultimaConexionStr);
    const ahora = new Date();
    const difMs = Math.max(0, ahora.getTime() - ultimaConexion.getTime());
    const difMinutos = Math.floor(difMs / 60000);

    if (difMinutos < 5) {
      return { online: true, texto: 'En línea' };
    } else if (difMinutos < 60) {
      return { online: false, texto: `Hace ${difMinutos} min` };
    } else {
      const difHoras = Math.floor(difMinutos / 60);
      if (difHoras < 24) {
        return { online: false, texto: `Hace ${difHoras} h` };
      } else {
        const difDias = Math.floor(difHoras / 24);
        return { online: false, texto: `Hace ${difDias} d` };
      }
    }
  };

  // Helper para formatear la hora del mensaje
  const formatearHora = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="ws-page-header">
          <div>
            <h2 className="title-medium" style={{ margin: 0 }}>Colaboradores y Mensajería</h2>
            <p className="subtitle-panel" style={{ margin: '4px 0 0 0' }}>
              Comunícate en tiempo real con los miembros de tus proyectos compartidos.
            </p>
          </div>
        </div>

        {/* Contenedor del Chat Principal */}
        <div className="chat-container">
          
          {/* Panel Lateral: Proyectos y Contactos */}
          <aside className={`chat-sidebar ${verChatMovil ? 'hidden md:flex' : 'flex'}`}>
            <div className="sidebar-header">
              <h3>Mis Proyectos</h3>
            </div>
            
            <div className="sidebar-scroll">
              {cargandoContactos ? (
                <div className="flex justify-center items-center py-8">
                  <div className="spinner-simple"></div>
                </div>
              ) : proyectosChat.length === 0 ? (
                <div className="sidebar-empty">
                  <span className="icon">💬</span>
                  <p>No tienes proyectos o colaboradores compartidos.</p>
                </div>
              ) : (
                proyectosChat.map(proyecto => {
                  const expandido = !!proyectosExpandidos[proyecto.id];
                  return (
                    <div key={proyecto.id} className="proyecto-group">
                      <button 
                        className="proyecto-title-btn"
                        onClick={() => toggleProyecto(proyecto.id)}
                      >
                        <span className="chevron">{expandido ? '▼' : '▶'}</span>
                        <span className="project-name">{proyecto.nombre}</span>
                        <span className="badge">{proyecto.miembros.length}</span>
                      </button>

                      {expandido && (
                        <div className="miembros-list">
                          {proyecto.miembros.map(miembro => {
                            const disp = obtenerDisponibilidad(miembro.ultimaConexion);
                            const seleccionado = contactoSeleccionado?.id === miembro.id;
                            
                            return (
                              <button
                                key={miembro.id}
                                className={`miembro-item ${seleccionado ? 'active' : ''}`}
                                onClick={() => seleccionarContacto(miembro, proyecto.id)}
                              >
                                <div className="avatar-container">
                                  <div className="avatar-circle">
                                    {miembro.nombre.substring(0, 2).toUpperCase()}
                                  </div>
                                  <span className={`status-dot ${disp.online ? 'online' : 'offline'}`} />
                                </div>

                                <div className="miembro-info">
                                  <div className="name-row">
                                    <span className="name">{miembro.nombre}</span>
                                    <span className="role-tag">{miembro.rol}</span>
                                  </div>
                                  <div className="status-row">
                                    <span className="email">{miembro.correo}</span>
                                    <span className={`time-text ${disp.online ? 'online' : ''}`}>
                                      {disp.texto}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Panel Derecho: Conversación */}
          <main className={`chat-conversation-panel ${!verChatMovil ? 'hidden md:flex' : 'flex'}`}>
            {contactoSeleccionado ? (
              <>
                {/* Header de conversación */}
                <header className="chat-header">
                  <button 
                    className="back-btn md:hidden"
                    onClick={() => setVerChatMovil(false)}
                    title="Volver"
                  >
                    ←
                  </button>

                  <div className="active-user-info">
                    <div className="avatar-circle">
                      {contactoSeleccionado.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="user-text">
                      <h4>{contactoSeleccionado.nombre}</h4>
                      <div className="meta">
                        <span className="role">{contactoSeleccionado.rol}</span>
                        <span className="separator">•</span>
                        <span className="email">{contactoSeleccionado.correo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="active-user-status">
                    {(() => {
                      const disp = obtenerDisponibilidad(contactoSeleccionado.ultimaConexion);
                      return (
                        <div className="status-indicator">
                          <span className={`status-dot ${disp.online ? 'online' : 'offline'}`} />
                          <span className="status-label">{disp.texto}</span>
                        </div>
                      );
                    })()}
                  </div>
                </header>

                {/* Hilo de mensajes */}
                <div className="chat-messages-area">
                  {cargandoHistorial ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="spinner-simple"></div>
                    </div>
                  ) : mensajes.length === 0 ? (
                    <div className="messages-empty">
                      <span className="icon">👋</span>
                      <p>¡Inicia el chat! Envía un mensaje para saludar a {contactoSeleccionado.nombre}.</p>
                    </div>
                  ) : (
                    <div className="messages-list">
                      {mensajes.map((msg) => {
                        const esEmisor = msg.emisorId === user?.id;
                        return (
                          <div 
                            key={msg.id} 
                            className={`message-bubble-wrapper ${esEmisor ? 'outgoing' : 'incoming'}`}
                            style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', margin: '4px 0' }}
                          >
                            {!esEmisor && (
                              <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '10px', flexShrink: 0 }}>
                                {contactoSeleccionado.nombre.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="bubble">
                              <p className="text">{msg.contenido}</p>
                              <div className="metadata">
                                <span className="time">{formatearHora(msg.fechaEnvio)}</span>
                                {esEmisor && (
                                  <span className={`status-icon ${msg.leido ? 'read' : 'unread'}`} title={msg.leido ? 'Leído' : 'Enviado'}>
                                    {msg.leido ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                            {esEmisor && (
                              <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '10px', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {myAvatar ? (
                                  <img src={myAvatar} alt="Yo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  (user?.username?.[0] ?? 'U').toUpperCase()
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Caja de entrada */}
                <footer className="chat-input-bar">
                  <form onSubmit={handleEnviar} className="input-form">
                    <input
                      type="text"
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      placeholder={`Escribe un mensaje para ${contactoSeleccionado.nombre}...`}
                      className="text-input"
                      maxLength={1000}
                    />
                    <button 
                      type="submit" 
                      disabled={!nuevoMensaje.trim()}
                      className="send-btn"
                    >
                      Enviar
                    </button>
                  </form>
                </footer>
              </>
            ) : (
              // Empty State
              <div className="chat-empty-state">
                <div className="logo-illustration">W</div>
                <h3>Tus Conversaciones</h3>
                <p>Selecciona un colaborador de la lista de la izquierda para ver su disponibilidad e iniciar una conversación.</p>
              </div>
            )}
          </main>
        </div>

        {/* Estilos CSS Premium Inyectados */}
        <style jsx global>{`
          /* Contenedor del Chat */
          .chat-container {
            display: flex;
            height: calc(100vh - 190px);
            min-height: 500px;
            background-color: #0d1527; /* Dark Mode Premium Slate */
            border: 1px solid #1e293b;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
            font-family: 'Outfit', system-ui, -apple-system, sans-serif;
          }

          /* Panel Lateral (Sidebar) */
          .chat-sidebar {
            width: 320px;
            flex-shrink: 0;
            border-right: 1px solid #1e293b;
            flex-direction: column;
            background-color: #0b101d; /* Más oscuro para contraste */
          }

          .sidebar-header {
            padding: 18px 20px;
            border-bottom: 1px solid #1e293b;
          }

          .sidebar-header h3 {
            font-size: 16px;
            font-weight: 600;
            color: #f8fafc;
            margin: 0;
            letter-spacing: -0.2px;
          }

          .sidebar-scroll {
            flex: 1;
            overflow-y: auto;
            padding: 12px 8px;
          }

          .sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background-color: #334155;
            border-radius: 4px;
          }

          /* Lista de Proyectos */
          .proyecto-group {
            margin-bottom: 8px;
          }

          .proyecto-title-btn {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 8px 12px;
            background: transparent;
            border: none;
            cursor: pointer;
            text-align: left;
            border-radius: 8px;
            color: #94a3b8;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s;
            margin-bottom: 4px;
          }

          .proyecto-title-btn:hover {
            background-color: rgba(255, 255, 255, 0.03);
            color: #f8fafc;
          }

          .proyecto-title-btn .chevron {
            font-size: 9px;
            margin-right: 8px;
            width: 12px;
            display: inline-block;
          }

          .proyecto-title-btn .project-name {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .proyecto-title-btn .badge {
            background-color: #1e293b;
            color: #38bdf8;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 12px;
            font-weight: bold;
            margin-left: 6px;
          }

          /* Miembros del Proyecto */
          .miembros-list {
            padding-left: 10px;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .miembro-item {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 10px 12px;
            background: transparent;
            border: none;
            cursor: pointer;
            text-align: left;
            border-radius: 8px;
            transition: all 0.2s;
            gap: 12px;
          }

          .miembro-item:hover {
            background-color: rgba(255, 255, 255, 0.05);
          }

          .miembro-item.active {
            background-color: rgba(37, 99, 235, 0.15);
            border-left: 3px solid #3b82f6;
            border-radius: 0 8px 8px 0;
            padding-left: 9px; /* Compensar borde */
          }

          /* Avatar */
          .avatar-container {
            position: relative;
            flex-shrink: 0;
          }

          .avatar-circle {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background-color: #334155;
            color: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 13px;
            border: 2px solid #0d1527;
          }

          .miembro-item.active .avatar-circle {
            background-color: #2563eb;
            color: #ffffff;
          }

          .status-dot {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 2px solid #0b101d;
          }

          .status-dot.online {
            background-color: #10b981;
          }

          .status-dot.offline {
            background-color: #64748b;
          }

          /* Información del Miembro */
          .miembro-info {
            flex: 1;
            min-width: 0; /* Permite truncar */
          }

          .miembro-info .name-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2px;
            gap: 6px;
          }

          .miembro-info .name {
            font-size: 14px;
            font-weight: 500;
            color: #f1f5f9;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          }

          .miembro-info .role-tag {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 1px 4px;
            background-color: rgba(255, 255, 255, 0.08);
            color: #94a3b8;
            border-radius: 4px;
          }

          .miembro-info .status-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #64748b;
          }

          .miembro-info .email {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            margin-right: 8px;
          }

          .miembro-info .time-text {
            flex-shrink: 0;
            font-size: 11px;
            font-weight: 500;
          }

          .miembro-info .time-text.online {
            color: #34d399;
          }

          /* Hilo de Conversación */
          .chat-conversation-panel {
            flex: 1;
            flex-direction: column;
            background-color: #0d1527;
          }

          .chat-header {
            display: flex;
            align-items: center;
            padding: 14px 20px;
            border-bottom: 1px solid #1e293b;
            background-color: #0f172a;
          }

          .back-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            font-size: 20px;
            cursor: pointer;
            margin-right: 14px;
            padding: 4px 8px;
            border-radius: 4px;
          }

          .back-btn:hover {
            background-color: rgba(255, 255, 255, 0.05);
            color: #ffffff;
          }

          .active-user-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
          }

          .active-user-info .avatar-circle {
            background-color: #2563eb;
            color: #ffffff;
            width: 40px;
            height: 40px;
            font-size: 14px;
          }

          .active-user-info h4 {
            margin: 0;
            font-size: 15px;
            font-weight: 600;
            color: #ffffff;
          }

          .active-user-info .meta {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #64748b;
            margin-top: 1px;
          }

          .active-user-info .meta .role {
            color: #38bdf8;
            font-weight: 500;
          }

          .active-user-status {
            flex-shrink: 0;
          }

          .status-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            background-color: #1e293b;
            padding: 4px 10px;
            border-radius: 20px;
          }

          .status-indicator .status-dot {
            position: relative;
            border: none;
            width: 8px;
            height: 8px;
          }

          .status-indicator .status-label {
            font-size: 12px;
            font-weight: 500;
            color: #e2e8f0;
          }

          /* Area de Mensajes */
          .chat-messages-area {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background-color: #090d16; /* Ligeramente más oscuro */
          }

          .chat-messages-area::-webkit-scrollbar {
            width: 6px;
          }
          .chat-messages-area::-webkit-scrollbar-thumb {
            background-color: #1e293b;
            border-radius: 6px;
          }

          .messages-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .message-bubble-wrapper {
            display: flex;
            width: 100%;
          }

          .message-bubble-wrapper.outgoing {
            justify-content: flex-end;
          }

          .message-bubble-wrapper.incoming {
            justify-content: flex-start;
          }

          .bubble {
            max-width: 65%;
            padding: 10px 14px;
            border-radius: 12px;
            position: relative;
          }

          .outgoing .bubble {
            background-color: #2563eb; /* Azul premium */
            color: #ffffff;
            border-bottom-right-radius: 2px;
          }

          .incoming .bubble {
            background-color: #1e293b; /* Slate 800 */
            color: #e2e8f0;
            border-bottom-left-radius: 2px;
          }

          .bubble .text {
            font-size: 14px;
            line-height: 1.45;
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
          }

          .bubble .metadata {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 4px;
            margin-top: 4px;
            font-size: 10px;
          }

          .outgoing .bubble .time {
            color: #93c5fd;
          }

          .incoming .bubble .time {
            color: #64748b;
          }

          .status-icon {
            font-size: 9px;
            font-weight: bold;
          }

          .status-icon.unread {
            color: #93c5fd;
          }

          .status-icon.read {
            color: #60a5fa;
          }

          /* Caja de entrada (Input Bar) */
          .chat-input-bar {
            padding: 16px 20px;
            border-top: 1px solid #1e293b;
            background-color: #0f172a;
          }

          .input-form {
            display: flex;
            gap: 12px;
          }

          .text-input {
            flex: 1;
            background-color: #0d1527;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 12px 16px;
            color: #ffffff;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
          }

          .text-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
          }

          .send-btn {
            background-color: #2563eb;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            padding: 0 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .send-btn:hover:not(:disabled) {
            background-color: #1d4ed8;
          }

          .send-btn:disabled {
            background-color: #1e293b;
            color: #475569;
            cursor: not-allowed;
          }

          /* Empty States y Spinners */
          .chat-empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            padding: 40px;
            text-align: center;
            background-color: #090d16;
          }

          .logo-illustration {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            background: rgba(37, 99, 235, 0.1);
            color: #3b82f6;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 800;
            font-family: 'JetBrains Mono', monospace;
            margin-bottom: 20px;
            border: 1px solid rgba(37, 99, 235, 0.2);
          }

          .chat-empty-state h3 {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            margin: 0 0 8px 0;
          }

          .chat-empty-state p {
            max-width: 320px;
            font-size: 14px;
            color: #64748b;
            line-height: 1.5;
            margin: 0;
          }

          .sidebar-empty, .messages-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 32px 16px;
            text-align: center;
            color: #64748b;
          }

          .sidebar-empty .icon, .messages-empty .icon {
            font-size: 24px;
            margin-bottom: 8px;
          }

          .sidebar-empty p, .messages-empty p {
            font-size: 13px;
            margin: 0;
            line-height: 1.4;
          }

          .spinner-simple {
            width: 24px;
            height: 24px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Media Queries para Responsive */
          @media (max-width: 767px) {
            .chat-sidebar {
              width: 100%;
            }
            .chat-conversation-panel {
              width: 100%;
            }
            .bubble {
              max-width: 80%;
            }
          }
        `}</style>
      </AppLayout>
    </ProtectedRoute>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSpinner
} from '@ionic/react';
import useAuth from '../hooks/useAuth';
import { obtenerContactos, obtenerHistorial, enviarMensaje } from '../services/mensajeService';
import type { ProyectoMiembrosChat, MiembroChat, Mensaje } from '../types/mensaje';
import './Chat.css';

const Chat: React.FC = () => {
  const { user } = useAuth();
  
  const [proyectosChat, setProyectosChat] = useState<ProyectoMiembrosChat[]>([]);
  const [contactoSeleccionado, setContactoSeleccionado] = useState<MiembroChat | null>(null);
  const [proyectoActivoId, setProyectoActivoId] = useState<number | undefined>(undefined);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  
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
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 50);
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
      scrollToBottom('smooth');
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

  // Calcular disponibilidad
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

  // Helper para formatear la hora
  const formatearHora = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mensajería de Proyectos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-no-padding">
        <div className="chat-container">
          
          {/* Panel Lateral: Proyectos y Contactos */}
          <aside className={`chat-sidebar ${verChatMovil ? 'hidden' : ''}`}>
            <div className="sidebar-header">
              <h3>Mis Colaboradores</h3>
            </div>
            
            <div className="sidebar-scroll">
              {cargandoContactos ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <IonSpinner name="crescent" color="primary" />
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
                            // No mostrar al propio usuario logueado en la lista de contactos
                            if (miembro.id === user?.id) return null;
                            
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
          <main className={`chat-conversation-panel ${!verChatMovil ? 'hidden' : ''}`}>
            {contactoSeleccionado ? (
              <>
                {/* Header de conversación */}
                <header className="chat-header">
                  <button 
                    className="back-btn"
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
                        <span style={{ color: '#475569' }}>•</span>
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
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <IonSpinner name="crescent" color="primary" />
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
                          >
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
              // Estado vacío (Sin selección)
              <div className="chat-empty-state">
                <div className="logo-illustration">W</div>
                <h3>Tus Conversaciones</h3>
                <p>Selecciona un colaborador de la lista para ver su disponibilidad e iniciar una conversación.</p>
              </div>
            )}
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Chat;

// Base de datos simulada en localStorage para modo 100% Offline

export interface LocalUsuario {
  id: number;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string;
  ultimaConexion?: string;
}

export interface LocalProyecto {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  fechaCreacion: string;
  activo: boolean;
  eliminadoLogicamente: boolean;
  prioridad: string;
  responsable: string;
}

export interface LocalTarea {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  responsableId: number | null;
  proyectoId: number;
  fechaLimite: string;
  fechaCreacion: string;
  dependencias: number[];
  evidencias: string[];
  tareaPadreId?: number | null;
  eliminadoLogicamente?: boolean;
}

export interface LocalComentario {
  id: number;
  tareaId: number;
  usuarioId: number;
  usuarioNombre: string;
  contenido: string;
  fechaCreacion: string;
}

export interface LocalMensaje {
  id: number;
  remitenteId: number;
  destinatarioId: number;
  contenido: string;
  fechaEnvio: string;
  leido: boolean;
  proyectoId: number;
}

export interface LocalMiembro {
  id: number;
  proyectoId: number;
  usuarioId: number;
  rol: string;
  activo: boolean;
  fechaIngreso: string;
}

export interface LocalHistorial {
  id: number;
  tareaId: number;
  usuarioId: number;
  usuarioNombre: string;
  estadoAnterior: string;
  estadoNuevo: string;
  motivo: string;
  fecha: string;
}

// Helper para leer/escribir colecciones en localStorage
const readCollection = <T>(key: string): T[] => {
  const data = localStorage.getItem(`ws_db_${key}`);
  return data ? JSON.parse(data) : [];
};

const writeCollection = <T>(key: string, data: T[]): void => {
  localStorage.setItem(`ws_db_${key}`, JSON.stringify(data));
};

// Semilla de datos iniciales
const inicializarDatos = () => {
  if (localStorage.getItem('ws_db_initialized') === 'true') {
    return;
  }

  // 1. Usuarios
  const usuariosSeed: LocalUsuario[] = [
    { id: 1, nombre: 'Admin Master', correo: 'admin@worksync.com', contrasena: 'Pass123_', rol: 'ADMIN' },
    { id: 2, nombre: 'Líder del Proyecto', correo: 'lider@worksync.com', contrasena: 'Pass123_', rol: 'LIDER' },
    { id: 3, nombre: 'Juan Colaborador', correo: 'colab@worksync.com', contrasena: 'Pass123_', rol: 'COLABORADOR' }
  ];

  // 2. Proyectos
  const proyectosSeed: LocalProyecto[] = [
    {
      id: 1,
      nombre: 'Proyecto Worksync Móvil',
      descripcion: 'Desarrollo de la versión móvil nativa en Ionic React',
      estado: 'ACTIVO',
      fechaInicio: '2026-06-01',
      fechaFin: '2026-07-31',
      fechaCreacion: new Date().toISOString(),
      activo: true,
      eliminadoLogicamente: false,
      prioridad: 'ALTA',
      responsable: 'Líder del Proyecto'
    },
    {
      id: 2,
      nombre: 'Rediseño Portal Corporativo',
      descripcion: 'Modernización del portal institucional web con arquitectura Serverless',
      estado: 'ACTIVO',
      fechaInicio: '2026-05-15',
      fechaFin: '2026-08-15',
      fechaCreacion: new Date().toISOString(),
      activo: true,
      eliminadoLogicamente: false,
      prioridad: 'MEDIA',
      responsable: 'Líder del Proyecto'
    }
  ];

  // 3. Miembros
  const miembrosSeed: LocalMiembro[] = [
    { id: 1, proyectoId: 1, usuarioId: 2, rol: 'LIDER', activo: true, fechaIngreso: new Date().toISOString() },
    { id: 2, proyectoId: 1, usuarioId: 3, rol: 'COLABORADOR', activo: true, fechaIngreso: new Date().toISOString() },
    { id: 3, proyectoId: 2, usuarioId: 2, rol: 'LIDER', activo: true, fechaIngreso: new Date().toISOString() },
    { id: 4, proyectoId: 2, usuarioId: 1, rol: 'ADMIN', activo: true, fechaIngreso: new Date().toISOString() }
  ];

  // 4. Tareas
  const tareasSeed: LocalTarea[] = [
    {
      id: 1,
      titulo: 'Configurar entorno de desarrollo',
      descripcion: 'Instalar Node, Capacitor, Ionic y configurar el emulador de Android.',
      estado: 'COMPLETADA',
      prioridad: 'MEDIA',
      responsableId: 3,
      proyectoId: 1,
      fechaLimite: '2026-06-15',
      fechaCreacion: new Date().toISOString(),
      dependencias: [],
      evidencias: [],
      eliminadoLogicamente: false
    },
    {
      id: 2,
      titulo: 'Diseñar pantalla de login',
      descripcion: 'Implementar el diseño de tarjetas neomorphic, soporte para registro y recuperar contraseña.',
      estado: 'EN_PROGRESO',
      prioridad: 'ALTA',
      responsableId: 3,
      proyectoId: 1,
      fechaLimite: '2026-07-10',
      fechaCreacion: new Date().toISOString(),
      dependencias: [1],
      evidencias: [],
      eliminadoLogicamente: false
    },
    {
      id: 3,
      titulo: 'Integrar almacenamiento local offline',
      descripcion: 'Crear adaptador de base de datos embebido usando localStorage para portar todo sin internet.',
      estado: 'PENDIENTE',
      prioridad: 'CRITICA',
      responsableId: 2,
      proyectoId: 1,
      fechaLimite: '2026-07-20',
      fechaCreacion: new Date().toISOString(),
      dependencias: [2],
      evidencias: [],
      eliminadoLogicamente: false
    },
    {
      id: 4,
      titulo: 'Definir arquitectura de API en producción',
      descripcion: 'Preparar esquemas de base de datos y despliegue inicial.',
      estado: 'COMPLETADA',
      prioridad: 'BAJA',
      responsableId: 2,
      proyectoId: 2,
      fechaLimite: '2026-06-01',
      fechaCreacion: new Date().toISOString(),
      dependencias: [],
      evidencias: [],
      eliminadoLogicamente: false
    }
  ];

  // 5. Comentarios
  const comentariosSeed: LocalComentario[] = [
    {
      id: 1,
      tareaId: 2,
      usuarioId: 3,
      usuarioNombre: 'Juan Colaborador',
      contenido: 'Ya he subido los bocetos preliminares de la interfaz y las paletas HSL.',
      fechaCreacion: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 2,
      tareaId: 2,
      usuarioId: 2,
      usuarioNombre: 'Líder del Proyecto',
      contenido: 'Se ve excelente. Continuemos con la maquetación en React.',
      fechaCreacion: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  // 6. Mensajes
  const mensajesSeed: LocalMensaje[] = [
    {
      id: 1,
      remitenteId: 2,
      destinatarioId: 3,
      contenido: 'Hola Juan, ¿cómo vas con los entregables de la versión móvil?',
      fechaEnvio: new Date(Date.now() - 3600000 * 24).toISOString(),
      leido: true,
      proyectoId: 1
    },
    {
      id: 2,
      remitenteId: 3,
      destinatarioId: 2,
      contenido: 'Hola! Muy bien, estoy terminando la integración del Login y la pantalla de Chat. Ya conecté el polling local.',
      fechaEnvio: new Date(Date.now() - 3600000 * 23).toISOString(),
      leido: true,
      proyectoId: 1
    },
    {
      id: 3,
      remitenteId: 2,
      destinatarioId: 3,
      contenido: 'Genial. Recuerda subir los commits al repositorio.',
      fechaEnvio: new Date(Date.now() - 3600000 * 22).toISOString(),
      leido: false,
      proyectoId: 1
    }
  ];

  // 7. Historial de Auditoría
  const historialSeed: LocalHistorial[] = [
    {
      id: 1,
      tareaId: 1,
      usuarioId: 3,
      usuarioNombre: 'Juan Colaborador',
      estadoAnterior: 'EN_PROGRESO',
      estadoNuevo: 'COMPLETADA',
      motivo: 'Instalación limpia finalizada en simulador Android Studio.',
      fecha: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: 2,
      tareaId: 2,
      usuarioId: 3,
      usuarioNombre: 'Juan Colaborador',
      estadoAnterior: 'PENDIENTE',
      estadoNuevo: 'EN_PROGRESO',
      motivo: 'Iniciando diseño de interfaz con Tailwind/CSS.',
      fecha: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ];

  writeCollection('usuarios', usuariosSeed);
  writeCollection('proyectos', proyectosSeed);
  writeCollection('miembros', miembrosSeed);
  writeCollection('tareas', tareasSeed);
  writeCollection('comentarios', comentariosSeed);
  writeCollection('mensajes', mensajesSeed);
  writeCollection('historial', historialSeed);
  localStorage.setItem('ws_db_initialized', 'true');
};

// Inicializar de inmediato al importar el módulo
inicializarDatos();

// Métodos de acceso público
export const db = {
  // --- USUARIOS ---
  usuarios: {
    getAll: () => readCollection<LocalUsuario>('usuarios'),
    getById: (id: number) => readCollection<LocalUsuario>('usuarios').find(u => u.id === id),
    getByCorreo: (correo: string) => readCollection<LocalUsuario>('usuarios').find(u => u.correo === correo),
    create: (u: Omit<LocalUsuario, 'id'>) => {
      const list = readCollection<LocalUsuario>('usuarios');
      const nextId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
      const newUser = { ...u, id: nextId };
      list.push(newUser);
      writeCollection('usuarios', list);
      return newUser;
    },
    update: (id: number, fields: Partial<LocalUsuario>) => {
      const list = readCollection<LocalUsuario>('usuarios');
      const idx = list.findIndex(x => x.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...fields };
        writeCollection('usuarios', list);
        return list[idx];
      }
      throw new Error('Usuario no encontrado');
    }
  },

  // --- PROYECTOS ---
  proyectos: {
    getAll: () => readCollection<LocalProyecto>('proyectos').filter(p => !p.eliminadoLogicamente),
    getById: (id: number) => readCollection<LocalProyecto>('proyectos').find(p => p.id === id),
    create: (p: Omit<LocalProyecto, 'id' | 'fechaCreacion' | 'activo' | 'eliminadoLogicamente'>) => {
      const list = readCollection<LocalProyecto>('proyectos');
      const nextId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
      const newProj: LocalProyecto = {
        ...p,
        id: nextId,
        fechaCreacion: new Date().toISOString(),
        activo: true,
        eliminadoLogicamente: false
      };
      list.push(newProj);
      writeCollection('proyectos', list);
      return newProj;
    },
    update: (id: number, fields: Partial<LocalProyecto>) => {
      const list = readCollection<LocalProyecto>('proyectos');
      const idx = list.findIndex(x => x.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...fields };
        writeCollection('proyectos', list);
        return list[idx];
      }
      throw new Error('Proyecto no encontrado');
    },
    delete: (id: number) => {
      const list = readCollection<LocalProyecto>('proyectos');
      const idx = list.findIndex(x => x.id === id);
      if (idx !== -1) {
        list[idx].eliminadoLogicamente = true;
        writeCollection('proyectos', list);
      }
    }
  },

  // --- MIEMBROS ---
  miembros: {
    getAll: () => readCollection<LocalMiembro>('miembros'),
    getByProyecto: (proyectoId: number) => readCollection<LocalMiembro>('miembros').filter(m => m.proyectoId === proyectoId && m.activo),
    create: (m: Omit<LocalMiembro, 'id' | 'fechaIngreso' | 'activo'>) => {
      const list = readCollection<LocalMiembro>('miembros');
      const nextId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
      const newMemb: LocalMiembro = {
        ...m,
        id: nextId,
        activo: true,
        fechaIngreso: new Date().toISOString()
      };
      list.push(newMemb);
      writeCollection('miembros', list);
      return newMemb;
    },
    remove: (proyectoId: number, usuarioId: number) => {
      const list = readCollection<LocalMiembro>('miembros');
      const idx = list.findIndex(m => m.proyectoId === proyectoId && m.usuarioId === usuarioId);
      if (idx !== -1) {
        list[idx].activo = false;
        writeCollection('miembros', list);
      }
    }
  },

  // --- TAREAS ---
  tareas: {
    getAll: () => readCollection<LocalTarea>('tareas').filter(t => !t.eliminadoLogicamente),
    getById: (id: number) => readCollection<LocalTarea>('tareas').find(t => t.id === id && !t.eliminadoLogicamente),
    getByProyecto: (proyectoId: number) => readCollection<LocalTarea>('tareas').filter(t => t.proyectoId === proyectoId && !t.eliminadoLogicamente),
    getSubtareas: (padreId: number) => readCollection<LocalTarea>('tareas').filter(t => t.tareaPadreId === padreId && !t.eliminadoLogicamente),
    create: (t: Omit<LocalTarea, 'id' | 'fechaCreacion' | 'evidencias' | 'dependencias' | 'eliminadoLogicamente'> & { dependencias?: number[] }) => {
      const list = readCollection<LocalTarea>('tareas');
      const nextId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
      const newT: LocalTarea = {
        ...t,
        id: nextId,
        estado: t.estado || 'PENDIENTE',
        fechaCreacion: new Date().toISOString(),
        dependencias: t.dependencias || [],
        evidencias: [],
        eliminadoLogicamente: false
      };
      list.push(newT);
      writeCollection('tareas', list);
      return newT;
    },
    update: (id: number, fields: Partial<LocalTarea>) => {
      const list = readCollection<LocalTarea>('tareas');
      const idx = list.findIndex(x => x.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...fields };
        writeCollection('tareas', list);
        return list[idx];
      }
      throw new Error('Tarea no encontrada');
    },
    delete: (id: number) => {
      const list = readCollection<LocalTarea>('tareas');
      const idx = list.findIndex(x => x.id === id);
      if (idx !== -1) {
        list[idx].eliminadoLogicamente = true;
        writeCollection('tareas', list);
      }
    }
  },

  // --- COMENTARIOS ---
  comentarios: {
    getByTarea: (tareaId: number) => readCollection<LocalComentario>('comentarios').filter(c => c.tareaId === tareaId),
    create: (c: Omit<LocalComentario, 'id' | 'fechaCreacion'>) => {
      const list = readCollection<LocalComentario>('comentarios');
      const nextId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
      const newComment: LocalComentario = {
        ...c,
        id: nextId,
        fechaCreacion: new Date().toISOString()
      };
      list.push(newComment);
      writeCollection('comentarios', list);
      return newComment;
    }
  },

  // --- HISTORIAL AUDITORIA ---
  historial: {
    getByTarea: (tareaId: number) => readCollection<LocalHistorial>('historial').filter(h => h.tareaId === tareaId),
    create: (h: Omit<LocalHistorial, 'id' | 'fecha'>) => {
      const list = readCollection<LocalHistorial>('historial');
      const nextId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
      const newLog: LocalHistorial = {
        ...h,
        id: nextId,
        fecha: new Date().toISOString()
      };
      list.push(newLog);
      writeCollection('historial', list);
      return newLog;
    }
  },

  // --- MENSAJES ---
  mensajes: {
    getAll: () => readCollection<LocalMensaje>('mensajes'),
    getByConversation: (u1: number, u2: number) => {
      return readCollection<LocalMensaje>('mensajes').filter(m =>
        (m.remitenteId === u1 && m.destinatarioId === u2) ||
        (m.remitenteId === u2 && m.destinatarioId === u1)
      ).sort((a, b) => new Date(a.fechaEnvio).getTime() - new Date(b.fechaEnvio).getTime());
    },
    create: (m: Omit<LocalMensaje, 'id' | 'fechaEnvio' | 'leido'>) => {
      const list = readCollection<LocalMensaje>('mensajes');
      const nextId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
      const newMsg: LocalMensaje = {
        ...m,
        id: nextId,
        fechaEnvio: new Date().toISOString(),
        leido: false
      };
      list.push(newMsg);
      writeCollection('mensajes', list);
      return newMsg;
    },
    markAsRead: (remitenteId: number, destinatarioId: number) => {
      const list = readCollection<LocalMensaje>('mensajes');
      let changed = false;
      list.forEach(m => {
        if (m.remitenteId === remitenteId && m.destinatarioId === destinatarioId && !m.leido) {
          m.leido = true;
          changed = true;
        }
      });
      if (changed) {
        writeCollection('mensajes', list);
      }
    }
  }
};

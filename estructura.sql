--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_status_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;
ALTER TABLE IF EXISTS ONLY public.task_dependencies DROP CONSTRAINT IF EXISTS task_dependencies_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_dependencies DROP CONSTRAINT IF EXISTS task_dependencies_depends_on_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tarea DROP CONSTRAINT IF EXISTS tarea_proyecto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tarea_evidencias DROP CONSTRAINT IF EXISTS tarea_evidencias_tarea_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tarea_dependencias DROP CONSTRAINT IF EXISTS tarea_dependencias_tarea_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tarea_dependencias DROP CONSTRAINT IF EXISTS tarea_dependencias_dependencia_id_fkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_owner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_users DROP CONSTRAINT IF EXISTS project_users_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_users DROP CONSTRAINT IF EXISTS project_users_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.miembro_proyecto DROP CONSTRAINT IF EXISTS miembro_proyecto_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.miembro_proyecto DROP CONSTRAINT IF EXISTS miembro_proyecto_proyecto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comentarios_tarea DROP CONSTRAINT IF EXISTS comentarios_tarea_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comentarios_tarea DROP CONSTRAINT IF EXISTS comentarios_tarea_tarea_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bitacora DROP CONSTRAINT IF EXISTS bitacora_user_id_fkey;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_tasks_status;
DROP INDEX IF EXISTS public.idx_tasks_project;
DROP INDEX IF EXISTS public.idx_tasks_assigned;
DROP INDEX IF EXISTS public.idx_tarea_proyecto;
DROP INDEX IF EXISTS public.idx_progress_task;
DROP INDEX IF EXISTS public.idx_comments_task;
DROP INDEX IF EXISTS public.idx_bitacora_user;
DROP INDEX IF EXISTS public.idx_bitacora_entity;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_correo_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.miembro_proyecto DROP CONSTRAINT IF EXISTS uk2dt82otwqoth0x3t48s3hbt5a;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.task_status DROP CONSTRAINT IF EXISTS task_status_pkey;
ALTER TABLE IF EXISTS ONLY public.task_priority DROP CONSTRAINT IF EXISTS task_priority_pkey;
ALTER TABLE IF EXISTS ONLY public.task_dependencies DROP CONSTRAINT IF EXISTS task_dependencies_task_id_depends_on_task_id_key;
ALTER TABLE IF EXISTS ONLY public.task_dependencies DROP CONSTRAINT IF EXISTS task_dependencies_pkey;
ALTER TABLE IF EXISTS ONLY public.tarea DROP CONSTRAINT IF EXISTS tarea_pkey;
ALTER TABLE IF EXISTS ONLY public.tarea_dependencias DROP CONSTRAINT IF EXISTS tarea_dependencias_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.proyecto DROP CONSTRAINT IF EXISTS proyecto_pkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public.project_users DROP CONSTRAINT IF EXISTS project_users_user_id_project_id_key;
ALTER TABLE IF EXISTS ONLY public.project_users DROP CONSTRAINT IF EXISTS project_users_pkey;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_pkey;
ALTER TABLE IF EXISTS ONLY public.notificaciones DROP CONSTRAINT IF EXISTS notificaciones_pkey;
ALTER TABLE IF EXISTS ONLY public.miembro_proyecto DROP CONSTRAINT IF EXISTS miembro_proyecto_proyecto_id_usuario_id_key;
ALTER TABLE IF EXISTS ONLY public.miembro_proyecto DROP CONSTRAINT IF EXISTS miembro_proyecto_pkey;
ALTER TABLE IF EXISTS ONLY public.mensajes DROP CONSTRAINT IF EXISTS mensajes_pkey;
ALTER TABLE IF EXISTS ONLY public.historial_cambio_tarea DROP CONSTRAINT IF EXISTS historial_cambio_tarea_pkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_pkey;
ALTER TABLE IF EXISTS ONLY public.comentarios_tarea DROP CONSTRAINT IF EXISTS comentarios_tarea_pkey;
ALTER TABLE IF EXISTS ONLY public.bitacora DROP CONSTRAINT IF EXISTS bitacora_pkey;
ALTER TABLE IF EXISTS public.usuarios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tasks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.task_status ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.task_priority ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.task_dependencies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tarea ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.proyecto ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.projects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.project_users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.progress ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.miembro_proyecto ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.comentarios_tarea ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bitacora ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.usuarios_id_seq;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.tasks_id_seq;
DROP TABLE IF EXISTS public.tasks;
DROP SEQUENCE IF EXISTS public.task_status_id_seq;
DROP TABLE IF EXISTS public.task_status;
DROP SEQUENCE IF EXISTS public.task_priority_id_seq;
DROP TABLE IF EXISTS public.task_priority;
DROP SEQUENCE IF EXISTS public.task_dependencies_id_seq;
DROP TABLE IF EXISTS public.task_dependencies;
DROP SEQUENCE IF EXISTS public.tarea_id_seq;
DROP TABLE IF EXISTS public.tarea_evidencias;
DROP TABLE IF EXISTS public.tarea_dependencias;
DROP TABLE IF EXISTS public.tarea;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.proyecto_id_seq;
DROP TABLE IF EXISTS public.proyecto;
DROP SEQUENCE IF EXISTS public.projects_id_seq;
DROP TABLE IF EXISTS public.projects;
DROP SEQUENCE IF EXISTS public.project_users_id_seq;
DROP TABLE IF EXISTS public.project_users;
DROP SEQUENCE IF EXISTS public.progress_id_seq;
DROP TABLE IF EXISTS public.progress;
DROP TABLE IF EXISTS public.notificaciones;
DROP SEQUENCE IF EXISTS public.miembro_proyecto_id_seq;
DROP TABLE IF EXISTS public.miembro_proyecto;
DROP TABLE IF EXISTS public.mensajes;
DROP TABLE IF EXISTS public.historial_cambio_tarea;
DROP SEQUENCE IF EXISTS public.comments_id_seq;
DROP TABLE IF EXISTS public.comments;
DROP SEQUENCE IF EXISTS public.comentarios_tarea_id_seq;
DROP TABLE IF EXISTS public.comentarios_tarea;
DROP SEQUENCE IF EXISTS public.bitacora_id_seq;
DROP TABLE IF EXISTS public.bitacora;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bitacora; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.bitacora (
    id integer NOT NULL,
    user_id integer,
    action text,
    entity character varying(100),
    entity_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: bitacora_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.bitacora_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: bitacora_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.bitacora_id_seq OWNED BY public.bitacora.id;


--
-- Name: comentarios_tarea; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.comentarios_tarea (
    id bigint NOT NULL,
    tarea_id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    contenido text NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: comentarios_tarea_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.comentarios_tarea_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: comentarios_tarea_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.comentarios_tarea_id_seq OWNED BY public.comentarios_tarea.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    task_id integer,
    user_id integer,
    content text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: historial_cambio_tarea; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_cambio_tarea (
    id bigint NOT NULL,
    estado_anterior character varying(255) NOT NULL,
    estado_nuevo character varying(255) NOT NULL,
    fecha timestamp(6) without time zone NOT NULL,
    motivo text,
    tarea_id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    usuario_nombre character varying(255) NOT NULL
);



--
-- Name: historial_cambio_tarea_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.historial_cambio_tarea ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.historial_cambio_tarea_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mensajes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensajes (
    id bigint NOT NULL,
    contenido text NOT NULL,
    emisor_id bigint NOT NULL,
    fecha_envio timestamp(6) without time zone NOT NULL,
    leido boolean NOT NULL,
    proyecto_id bigint,
    receptor_id bigint NOT NULL
);



--
-- Name: mensajes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mensajes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mensajes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: miembro_proyecto; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.miembro_proyecto (
    id bigint NOT NULL,
    proyecto_id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    rol character varying(255) NOT NULL,
    fecha_ingreso timestamp with time zone DEFAULT now() NOT NULL,
    activo boolean DEFAULT true NOT NULL
);



--
-- Name: miembro_proyecto_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.miembro_proyecto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: miembro_proyecto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.miembro_proyecto_id_seq OWNED BY public.miembro_proyecto.id;


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificaciones (
    id bigint NOT NULL,
    fecha timestamp(6) without time zone NOT NULL,
    leida boolean NOT NULL,
    mensaje text NOT NULL,
    usuario_id bigint NOT NULL
);



--
-- Name: notificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.notificaciones ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notificaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: progress; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.progress (
    id integer NOT NULL,
    task_id integer,
    user_id integer,
    percentage integer,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT progress_percentage_check CHECK (((percentage >= 0) AND (percentage <= 100)))
);



--
-- Name: progress_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.progress_id_seq OWNED BY public.progress.id;


--
-- Name: project_users; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.project_users (
    id integer NOT NULL,
    user_id integer,
    project_id integer
);



--
-- Name: project_users_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.project_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: project_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.project_users_id_seq OWNED BY public.project_users.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    start_date date,
    end_date date,
    owner_id integer NOT NULL
);



--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: proyecto; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.proyecto (
    id bigint NOT NULL,
    nombre character varying(255),
    descripcion character varying(255),
    estado character varying(255),
    fecha_inicio date,
    fecha_fin date,
    fecha_creacion timestamp with time zone DEFAULT now(),
    activo boolean DEFAULT true NOT NULL,
    eliminado_logicamente boolean DEFAULT false NOT NULL,
    prioridad character varying(255),
    responsable character varying(255)
);



--
-- Name: proyecto_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.proyecto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: proyecto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.proyecto_id_seq OWNED BY public.proyecto.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);



--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: tarea; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.tarea (
    id bigint NOT NULL,
    titulo character varying(255),
    descripcion character varying(255),
    estado character varying(255),
    prioridad character varying(255),
    responsable character varying(255),
    fecha_limite date,
    fecha_creacion timestamp with time zone DEFAULT now(),
    proyecto_id bigint,
    eliminado_logicamente boolean DEFAULT false NOT NULL,
    tarea_padre_id bigint
);



--
-- Name: tarea_dependencias; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.tarea_dependencias (
    tarea_id bigint NOT NULL,
    dependencia_id bigint NOT NULL
);



--
-- Name: tarea_evidencias; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.tarea_evidencias (
    tarea_id bigint NOT NULL,
    evidencia_url character varying(255)
);



--
-- Name: tarea_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.tarea_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tarea_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.tarea_id_seq OWNED BY public.tarea.id;


--
-- Name: task_dependencies; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.task_dependencies (
    id integer NOT NULL,
    task_id integer,
    depends_on_task_id integer
);



--
-- Name: task_dependencies_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.task_dependencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: task_dependencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.task_dependencies_id_seq OWNED BY public.task_dependencies.id;


--
-- Name: task_priority; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.task_priority (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);



--
-- Name: task_priority_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.task_priority_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: task_priority_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.task_priority_id_seq OWNED BY public.task_priority.id;


--
-- Name: task_status; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.task_status (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);



--
-- Name: task_status_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.task_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: task_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.task_status_id_seq OWNED BY public.task_status.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    start_date date,
    end_date date,
    status_id integer,
    priority_id integer,
    project_id integer,
    assigned_to integer
);



--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);



--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: natsu
--

CREATE TABLE public.usuarios (
    id bigint NOT NULL,
    nombre character varying(255),
    correo character varying(255),
    contrasena character varying(255),
    rol character varying(255),
    ultima_conexion timestamp(6) without time zone
);



--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: natsu
--

CREATE SEQUENCE public.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: natsu
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: bitacora id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.bitacora ALTER COLUMN id SET DEFAULT nextval('public.bitacora_id_seq'::regclass);


--
-- Name: comentarios_tarea id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.comentarios_tarea ALTER COLUMN id SET DEFAULT nextval('public.comentarios_tarea_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: miembro_proyecto id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.miembro_proyecto ALTER COLUMN id SET DEFAULT nextval('public.miembro_proyecto_id_seq'::regclass);


--
-- Name: progress id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.progress ALTER COLUMN id SET DEFAULT nextval('public.progress_id_seq'::regclass);


--
-- Name: project_users id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.project_users ALTER COLUMN id SET DEFAULT nextval('public.project_users_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: proyecto id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.proyecto ALTER COLUMN id SET DEFAULT nextval('public.proyecto_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: tarea id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tarea ALTER COLUMN id SET DEFAULT nextval('public.tarea_id_seq'::regclass);


--
-- Name: task_dependencies id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.task_dependencies ALTER COLUMN id SET DEFAULT nextval('public.task_dependencies_id_seq'::regclass);


--
-- Name: task_priority id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.task_priority ALTER COLUMN id SET DEFAULT nextval('public.task_priority_id_seq'::regclass);


--
-- Name: task_status id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.task_status ALTER COLUMN id SET DEFAULT nextval('public.task_status_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: bitacora bitacora_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.bitacora
    ADD CONSTRAINT bitacora_pkey PRIMARY KEY (id);


--
-- Name: comentarios_tarea comentarios_tarea_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.comentarios_tarea
    ADD CONSTRAINT comentarios_tarea_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: historial_cambio_tarea historial_cambio_tarea_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_cambio_tarea
    ADD CONSTRAINT historial_cambio_tarea_pkey PRIMARY KEY (id);


--
-- Name: mensajes mensajes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_pkey PRIMARY KEY (id);


--
-- Name: miembro_proyecto miembro_proyecto_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.miembro_proyecto
    ADD CONSTRAINT miembro_proyecto_pkey PRIMARY KEY (id);


--
-- Name: miembro_proyecto miembro_proyecto_proyecto_id_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.miembro_proyecto
    ADD CONSTRAINT miembro_proyecto_proyecto_id_usuario_id_key UNIQUE (proyecto_id, usuario_id);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);


--
-- Name: project_users project_users_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_pkey PRIMARY KEY (id);


--
-- Name: project_users project_users_user_id_project_id_key; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_user_id_project_id_key UNIQUE (user_id, project_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: proyecto proyecto_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.proyecto
    ADD CONSTRAINT proyecto_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: tarea_dependencias tarea_dependencias_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tarea_dependencias
    ADD CONSTRAINT tarea_dependencias_pkey PRIMARY KEY (tarea_id, dependencia_id);


--
-- Name: tarea tarea_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tarea
    ADD CONSTRAINT tarea_pkey PRIMARY KEY (id);


--
-- Name: task_dependencies task_dependencies_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.task_dependencies
    ADD CONSTRAINT task_dependencies_pkey PRIMARY KEY (id);


--
-- Name: task_dependencies task_dependencies_task_id_depends_on_task_id_key; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.task_dependencies
    ADD CONSTRAINT task_dependencies_task_id_depends_on_task_id_key UNIQUE (task_id, depends_on_task_id);


--
-- Name: task_priority task_priority_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.task_priority
    ADD CONSTRAINT task_priority_pkey PRIMARY KEY (id);


--
-- Name: task_status task_status_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.task_status
    ADD CONSTRAINT task_status_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: miembro_proyecto uk2dt82otwqoth0x3t48s3hbt5a; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.miembro_proyecto
    ADD CONSTRAINT uk2dt82otwqoth0x3t48s3hbt5a UNIQUE (proyecto_id, usuario_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_bitacora_entity; Type: INDEX; Schema: public; Owner: natsu
--

CREATE INDEX idx_bitacora_entity ON public.bitacora USING btree (entity, entity_id);


--
-- Name: idx_bitacora_user; Type: INDEX; Schema: public; Owner: natsu
--

CREATE INDEX idx_bitacora_user ON public.bitacora USING btree (user_id);


--
-- Name: idx_comments_task; Type: INDEX; Schema: public; Owner: natsu
--

CREATE INDEX idx_comments_task ON public.comments USING btree (task_id);


--
-- Name: idx_progress_task; Type: INDEX; Schema: public; Owner: natsu
--

CREATE INDEX idx_progress_task ON public.progress USING btree (task_id);


--
-- Name: idx_tarea_proyecto; Type: INDEX; Schema: public; Owner: natsu
--

CREATE INDEX idx_tarea_proyecto ON public.tarea USING btree (proyecto_id);


--
-- Name: idx_tasks_assigned; Type: INDEX; Schema: public; Owner: natsu
--

CREATE INDEX idx_tasks_assigned ON public.tasks USING btree (assigned_to);


--
-- Name: idx_tasks_project; Type: INDEX; Schema: public; Owner: natsu
--

CREATE INDEX idx_tasks_project ON public.tasks USING btree (project_id);


--
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: natsu
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: natsu
--

CREATE INDEX idx_users_role ON public.users USING btree (role_id);


--
-- Name: bitacora bitacora_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.bitacora
    ADD CONSTRAINT bitacora_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: comentarios_tarea comentarios_tarea_tarea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.comentarios_tarea
    ADD CONSTRAINT comentarios_tarea_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tarea(id) ON DELETE CASCADE;


--
-- Name: comentarios_tarea comentarios_tarea_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.comentarios_tarea
    ADD CONSTRAINT comentarios_tarea_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: comments comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: miembro_proyecto miembro_proyecto_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.miembro_proyecto
    ADD CONSTRAINT miembro_proyecto_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyecto(id);


--
-- Name: miembro_proyecto miembro_proyecto_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.miembro_proyecto
    ADD CONSTRAINT miembro_proyecto_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: progress progress_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: progress progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: project_users project_users_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: project_users project_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: projects projects_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: tarea_dependencias tarea_dependencias_dependencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tarea_dependencias
    ADD CONSTRAINT tarea_dependencias_dependencia_id_fkey FOREIGN KEY (dependencia_id) REFERENCES public.tarea(id) ON DELETE CASCADE;


--
-- Name: tarea_dependencias tarea_dependencias_tarea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tarea_dependencias
    ADD CONSTRAINT tarea_dependencias_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tarea(id) ON DELETE CASCADE;


--
-- Name: tarea_evidencias tarea_evidencias_tarea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tarea_evidencias
    ADD CONSTRAINT tarea_evidencias_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tarea(id) ON DELETE CASCADE;


--
-- Name: tarea tarea_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tarea
    ADD CONSTRAINT tarea_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyecto(id);


--
-- Name: task_dependencies task_dependencies_depends_on_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.task_dependencies
    ADD CONSTRAINT task_dependencies_depends_on_task_id_fkey FOREIGN KEY (depends_on_task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_dependencies task_dependencies_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.task_dependencies
    ADD CONSTRAINT task_dependencies_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: tasks tasks_priority_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_priority_id_fkey FOREIGN KEY (priority_id) REFERENCES public.task_priority(id);


--
-- Name: tasks tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: tasks tasks_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.task_status(id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: natsu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--



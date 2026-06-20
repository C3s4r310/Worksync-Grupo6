-- ============================================================
-- PostgreSQL Schema
-- ============================================================

-- ------------------------------------------------------------
-- ROLES / CATÁLOGOS
-- ------------------------------------------------------------

CREATE TABLE roles (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE task_status (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE task_priority (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- ------------------------------------------------------------
-- USUARIOS (inglés)
-- ------------------------------------------------------------

CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100)        NOT NULL,
    email      VARCHAR(100)        NOT NULL UNIQUE,
    password   VARCHAR(255)        NOT NULL,
    role_id    INT                 REFERENCES roles(id),
    created_at TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- USUARIOS (español)
-- ------------------------------------------------------------

CREATE TABLE usuarios (
    id         BIGSERIAL PRIMARY KEY,
    nombre     VARCHAR(255),
    correo     VARCHAR(255) UNIQUE,
    contrasena VARCHAR(255),
    rol        VARCHAR(255)
);

-- ------------------------------------------------------------
-- PROYECTOS (inglés)
-- ------------------------------------------------------------

CREATE TABLE projects (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150)  NOT NULL,
    description TEXT,
    start_date  DATE,
    end_date    DATE,
    owner_id    INT           NOT NULL REFERENCES users(id)
);

CREATE TABLE project_users (
    id         SERIAL PRIMARY KEY,
    user_id    INT REFERENCES users(id),
    project_id INT REFERENCES projects(id),
    UNIQUE (user_id, project_id)
);

-- ------------------------------------------------------------
-- PROYECTOS (español)
-- ------------------------------------------------------------

CREATE TABLE proyecto (
    id                    BIGSERIAL PRIMARY KEY,
    nombre                VARCHAR(255),
    descripcion           VARCHAR(255),
    estado                VARCHAR(255),
    prioridad             VARCHAR(255),
    responsable           VARCHAR(255),
    fecha_inicio          DATE,
    fecha_fin             DATE,
    fecha_creacion        TIMESTAMPTZ          DEFAULT NOW(),
    activo                BOOLEAN NOT NULL     DEFAULT TRUE,
    eliminado_logicamente BOOLEAN NOT NULL     DEFAULT FALSE
);

CREATE TABLE miembro_proyecto (
    id            BIGSERIAL PRIMARY KEY,
    proyecto_id   BIGINT      NOT NULL REFERENCES proyecto(id),
    usuario_id    BIGINT      NOT NULL REFERENCES usuarios(id),
    rol           VARCHAR(255) NOT NULL,
    fecha_ingreso TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    UNIQUE (proyecto_id, usuario_id)
);

-- ------------------------------------------------------------
-- TAREAS (inglés)
-- ------------------------------------------------------------

CREATE TABLE tasks (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(150) NOT NULL,
    description TEXT,
    start_date  DATE,
    end_date    DATE,
    status_id   INT REFERENCES task_status(id),
    priority_id INT REFERENCES task_priority(id),
    project_id  INT REFERENCES projects(id),
    assigned_to INT REFERENCES users(id)
);

CREATE TABLE task_dependencies (
    id                 SERIAL PRIMARY KEY,
    task_id            INT REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE (task_id, depends_on_task_id)
);

CREATE TABLE comments (
    id         SERIAL PRIMARY KEY,
    task_id    INT         REFERENCES tasks(id) ON DELETE CASCADE,
    user_id    INT         REFERENCES users(id),
    content    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE progress (
    id          SERIAL PRIMARY KEY,
    task_id     INT         REFERENCES tasks(id) ON DELETE CASCADE,
    user_id     INT         REFERENCES users(id),
    percentage  INT         CHECK (percentage BETWEEN 0 AND 100),
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TAREAS (español)
-- ------------------------------------------------------------

CREATE TABLE tarea (
    id                    BIGSERIAL PRIMARY KEY,
    titulo                VARCHAR(255),
    descripcion           VARCHAR(255),
    estado                VARCHAR(255),
    prioridad             VARCHAR(255),
    responsable           VARCHAR(255),
    fecha_limite          DATE,
    fecha_creacion        TIMESTAMPTZ          DEFAULT NOW(),
    proyecto_id           BIGINT               REFERENCES proyecto(id),
    eliminado_logicamente BOOLEAN NOT NULL     DEFAULT FALSE
);

CREATE TABLE tarea_dependencias (
    tarea_id       BIGINT NOT NULL REFERENCES tarea(id) ON DELETE CASCADE,
    dependencia_id BIGINT          REFERENCES tarea(id) ON DELETE CASCADE,
    PRIMARY KEY (tarea_id, dependencia_id)
);

CREATE TABLE tarea_evidencias (
    tarea_id      BIGINT      NOT NULL REFERENCES tarea(id) ON DELETE CASCADE,
    evidencia_url VARCHAR(255)
);

CREATE TABLE comentarios_tarea (
    id             BIGSERIAL PRIMARY KEY,
    tarea_id       BIGINT      NOT NULL REFERENCES tarea(id) ON DELETE CASCADE,
    usuario_id     BIGINT      NOT NULL REFERENCES usuarios(id),
    contenido      TEXT        NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- BITÁCORA
-- ------------------------------------------------------------

CREATE TABLE bitacora (
    id         SERIAL PRIMARY KEY,
    user_id    INT         REFERENCES users(id),
    action     TEXT,
    entity     VARCHAR(100),
    entity_id  INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------

CREATE INDEX idx_users_role        ON users(role_id);
CREATE INDEX idx_tasks_project     ON tasks(project_id);
CREATE INDEX idx_tasks_assigned    ON tasks(assigned_to);
CREATE INDEX idx_tasks_status      ON tasks(status_id);
CREATE INDEX idx_comments_task     ON comments(task_id);
CREATE INDEX idx_progress_task     ON progress(task_id);
CREATE INDEX idx_tarea_proyecto    ON tarea(proyecto_id);
CREATE INDEX idx_bitacora_user     ON bitacora(user_id);
CREATE INDEX idx_bitacora_entity   ON bitacora(entity, entity_id);

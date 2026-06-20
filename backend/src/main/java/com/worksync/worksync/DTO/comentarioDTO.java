package com.worksync.worksync.DTO;

import java.time.LocalDateTime;

public class comentarioDTO {
    private Long id;
    private Long tareaId;
    private Long usuarioId;
    private String usuarioNombre;
    private String contenido;
    private LocalDateTime fechaCreacion;

    public comentarioDTO() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTareaId() { return tareaId; }
    public void setTareaId(Long tareaId) { this.tareaId = tareaId; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}

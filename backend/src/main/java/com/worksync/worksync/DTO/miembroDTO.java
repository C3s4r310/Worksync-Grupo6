package com.worksync.worksync.DTO;

import java.time.LocalDateTime;

public class miembroDTO {

    private Long id;
    private Long proyectoId;
    private Long usuarioId;
    private String nombreUsuario;
    private String correoUsuario;
    private String rol;
    private LocalDateTime fechaIngreso;
    private boolean activo;

    public miembroDTO() {}

    // Getters
    public Long getId() { return id; }
    public Long getProyectoId() { return proyectoId; }
    public Long getUsuarioId() { return usuarioId; }
    public String getNombreUsuario() { return nombreUsuario; }
    public String getCorreoUsuario() { return correoUsuario; }
    public String getRol() { return rol; }
    public LocalDateTime getFechaIngreso() { return fechaIngreso; }
    public boolean isActivo() { return activo; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setProyectoId(Long proyectoId) { this.proyectoId = proyectoId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
    public void setCorreoUsuario(String correoUsuario) { this.correoUsuario = correoUsuario; }
    public void setRol(String rol) { this.rol = rol; }
    public void setFechaIngreso(LocalDateTime fechaIngreso) { this.fechaIngreso = fechaIngreso; }
    public void setActivo(boolean activo) { this.activo = activo; }

}

package com.worksync.worksync.DTO;

import java.time.LocalDateTime;

public class MiembroChatDTO {
    private Long id;
    private String nombre;
    private String correo;
    private String rol;
    private boolean activo;
    private LocalDateTime ultimaConexion;

    public MiembroChatDTO() {}

    public MiembroChatDTO(Long id, String nombre, String correo, String rol, boolean activo, LocalDateTime ultimaConexion) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.rol = rol;
        this.activo = activo;
        this.ultimaConexion = ultimaConexion;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public LocalDateTime getUltimaConexion() { return ultimaConexion; }
    public void setUltimaConexion(LocalDateTime ultimaConexion) { this.ultimaConexion = ultimaConexion; }
}

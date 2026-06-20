package com.worksync.worksync.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(unique = true)
    private String correo;

    private String contrasena;

    // RF-08: Rol como enum (ADMIN, LIDER, COLABORADOR)
    @Convert(converter = RolConverter.class)
    private Rol rol;

    private java.time.LocalDateTime ultimaConexion;

    public Usuario() {}

    // Getters
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCorreo() { return correo; }
    public String getContrasena() { return contrasena; }
    public Rol getRol() { return rol; }
    public java.time.LocalDateTime getUltimaConexion() { return ultimaConexion; }

    // Setters
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setCorreo(String correo) { this.correo = correo; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
    public void setRol(Rol rol) { this.rol = rol; }
    public void setUltimaConexion(java.time.LocalDateTime ultimaConexion) { this.ultimaConexion = ultimaConexion; }
}
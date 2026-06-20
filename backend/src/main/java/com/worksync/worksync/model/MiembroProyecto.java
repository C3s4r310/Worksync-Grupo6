package com.worksync.worksync.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "miembro_proyecto", uniqueConstraints = @UniqueConstraint(columnNames = {"proyecto_id", "usuario_id"}))
public class MiembroProyecto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con Proyecto (solo el ID para no acoplar entidades)
    @Column(name = "proyecto_id", nullable = false)
    private Long proyectoId;

    // Relación con Usuario (solo el ID)
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    // RF-09: Rol del miembro dentro del proyecto (LIDER o COLABORADOR)
    @Convert(converter = RolConverter.class)
    @Column(nullable = false)
    private Rol rol;

    // RF-09: Fecha en que se agregó al miembro
    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDateTime fechaIngreso;

    // RF-09: Indica si el miembro sigue activo en el proyecto
    private boolean activo = true;

    public MiembroProyecto() {}

    @PrePersist
    public void prePersist() {
        this.fechaIngreso = LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public Long getProyectoId() { return proyectoId; }
    public Long getUsuarioId() { return usuarioId; }
    public Rol getRol() { return rol; }
    public LocalDateTime getFechaIngreso() { return fechaIngreso; }
    public boolean isActivo() { return activo; }

    // Setters
    public void setProyectoId(Long proyectoId) { this.proyectoId = proyectoId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public void setRol(Rol rol) { this.rol = rol; }
    public void setActivo(boolean activo) { this.activo = activo; }
}

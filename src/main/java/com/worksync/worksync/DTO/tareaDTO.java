package com.worksync.worksync.DTO;

import com.worksync.worksync.model.EstadoTarea;
import com.worksync.worksync.model.Prioridad;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class tareaDTO {
    
    private Long id;
    private String titulo;
    private String descripcion;
    private EstadoTarea estado;
    private Prioridad prioridad;
    private Long responsableId;
    private Long proyectoId;
    private LocalDate fechaLimite;
    private LocalDateTime fechaCreacion;
    private List<Long> dependencias;
    private List<String> evidencias;

    // Constructor vacío
    public tareaDTO() {}

    // --- GETTERS ---
    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public String getDescripcion() { return descripcion; }
    public EstadoTarea getEstado() { return estado; }
    public Prioridad getPrioridad() { return prioridad; }
    public Long getResponsableId() { return responsableId; }
    public Long getProyectoId() { return proyectoId; }
    public LocalDate getFechaLimite() { return fechaLimite; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public List<Long> getDependencias() { return dependencias; }
    public List<String> getEvidencias() { return evidencias; }

    // --- SETTERS ---
    public void setId(Long id) { this.id = id; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setEstado(EstadoTarea estado) { this.estado = estado; }
    public void setPrioridad(Prioridad prioridad) { this.prioridad = prioridad; }
    public void setResponsableId(Long responsableId) { this.responsableId = responsableId; }
    public void setProyectoId(Long proyectoId) { this.proyectoId = proyectoId; }
    public void setFechaLimite(LocalDate fechaLimite) { this.fechaLimite = fechaLimite; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public void setDependencias(List<Long> dependencias) { this.dependencias = dependencias; }
    public void setEvidencias(List<String> evidencias) { this.evidencias = evidencias; }
}
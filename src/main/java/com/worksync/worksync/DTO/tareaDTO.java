package com.worksync.worksync.DTO;

public class tareaDTO {
    
    private Long id;
    private String titulo;
    private String descripcion;
    private String estado;      // Esta es la variable que tu servicio intenta modificar
    private String prioridad;
    private Long responsableId;
    private Long proyectoId;

    // Constructor vacío
    public tareaDTO() {}

    // --- GETTERS ---
    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public String getDescripcion() { return descripcion; }
    
    public String getEstado() { // Para obtener el estado
        return estado; 
    }
    
    public String getPrioridad() { return prioridad; }
    public Long getResponsableId() { return responsableId; }
    public Long getProyectoId() { return proyectoId; }

    // --- SETTERS ---
    public void setId(Long id) { this.id = id; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    // Este es el método que falta y que soluciona tu error:
    public void setEstado(String estado) { 
        this.estado = estado; 
    }
    
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }
    public void setResponsableId(Long responsableId) { this.responsableId = responsableId; }
    public void setProyectoId(Long proyectoId) { this.proyectoId = proyectoId; }
}
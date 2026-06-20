package com.worksync.worksync.DTO;

public class ProgresoProyectoDTO {
    private Long proyectoId;
    private String proyectoNombre;
    private double porcentajeCompletitud;

    public ProgresoProyectoDTO() {}

    public ProgresoProyectoDTO(Long proyectoId, String proyectoNombre, double porcentajeCompletitud) {
        this.proyectoId = proyectoId;
        this.proyectoNombre = proyectoNombre;
        this.porcentajeCompletitud = porcentajeCompletitud;
    }

    public Long getProyectoId() { return proyectoId; }
    public void setProyectoId(Long proyectoId) { this.proyectoId = proyectoId; }

    public String getProyectoNombre() { return proyectoNombre; }
    public void setProyectoNombre(String proyectoNombre) { this.proyectoNombre = proyectoNombre; }

    public double getPorcentajeCompletitud() { return porcentajeCompletitud; }
    public void setPorcentajeCompletitud(double porcentajeCompletitud) { this.porcentajeCompletitud = porcentajeCompletitud; }
}

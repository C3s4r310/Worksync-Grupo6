package com.worksync.worksync.DTO;

import java.util.List;

public class ProyectoMiembrosChatDTO {
    private Long id;
    private String nombre;
    private List<MiembroChatDTO> miembros;

    public ProyectoMiembrosChatDTO() {}

    public ProyectoMiembrosChatDTO(Long id, String nombre, List<MiembroChatDTO> miembros) {
        this.id = id;
        this.nombre = nombre;
        this.miembros = miembros;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public List<MiembroChatDTO> getMiembros() { return miembros; }
    public void setMiembros(List<MiembroChatDTO> miembros) { this.miembros = miembros; }
}

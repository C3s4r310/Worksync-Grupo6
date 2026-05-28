package com.worksync.worksync.DTO;

import java.time.LocalDate;

public class proyectoDTO {
        private Long id;
        private String nombre;
        private String descripcion;
        private String estado;
        private LocalDate fechaInicio;
        private LocalDate fechaFin;

        // Constructor vacío
        public proyectoDTO() {}

        // --- GETTERS ---
        public Long getId() { return id; }
        public String getNombre() { return nombre; }
        public String getDescripcion() { return descripcion; }
        public String getEstado() { return estado; }
        public LocalDate getFechaInicio() { return fechaInicio; }
        public LocalDate getFechaFin() { return fechaFin; }

        // --- SETTERS ---
        public void setId(Long id) { this.id = id; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        public void setEstado(String estado) { this.estado = estado; }
        public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }
        public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }
}

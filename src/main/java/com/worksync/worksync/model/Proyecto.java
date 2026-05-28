package com.worksync.worksync.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "proyecto")
public class Proyecto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;

    // Estado del proyecto: ACTIVO, EN_PAUSA, FINALIZADO
    private String estado;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    // Fecha de creación automática
    private LocalDateTime fechaCreacion;

    // Eliminación lógica
    private boolean eliminadoLogicamente = false;

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }
}

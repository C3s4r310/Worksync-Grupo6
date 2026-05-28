package com.worksync.worksync.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Tarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private Prioridad prioridad;
    private String estado;
    private String responsable;
    private LocalDate fechaLimite;
    private LocalDateTime fechaCreacion;
    private Long proyectoId;
    private boolean eliminadoLogicamente = false;

    @ElementCollection
    @CollectionTable(name = "tarea_dependencias", joinColumns = @JoinColumn(name = "tarea_id"))
    @Column(name = "dependencia_id")
    private List<Long> dependencias = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "tarea_evidencias", joinColumns = @JoinColumn(name = "tarea_id"))
    @Column(name = "evidencia_url")
    private List<String> evidencias = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }
}

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

    // RF-14: Prioridad como enum (BAJA, MEDIA, ALTA, CRITICA)
    @Enumerated(EnumType.STRING)
    private Prioridad prioridad;

    private String estado;
    private String responsable;
    private LocalDate fechaLimite;

    // RF-03: Fecha de creación de la tarea
    private LocalDateTime fechaCreacion;

    // RF-03: Relación temporal con Proyecto (solo el ID, hasta que Arnold termine su módulo)
    private Long proyectoId;

    // RF-03: Eliminación lógica (no se borra físicamente de la BD)
    private boolean eliminadoLogicamente = false;

    // RF-03: Dependencias entre tareas (una tarea puede depender de otras)
    // Se guarda como lista de IDs para no acoplar con otras entidades Tarea en cascada
    @ElementCollection
    @CollectionTable(name = "tarea_dependencias", joinColumns = @JoinColumn(name = "tarea_id"))
    @Column(name = "dependencia_id")
    private List<Long> dependencias = new ArrayList<>();

    // RF-03: Evidencias (URLs o rutas de archivos adjuntos)
    @ElementCollection
    @CollectionTable(name = "tarea_evidencias", joinColumns = @JoinColumn(name = "tarea_id"))
    @Column(name = "evidencia_url")
    private List<String> evidencias = new ArrayList<>();

    // Asignar fecha de creación automáticamente antes de persistir
    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }
}

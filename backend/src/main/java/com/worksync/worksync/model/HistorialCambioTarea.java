package com.worksync.worksync.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "historial_cambio_tarea")
public class HistorialCambioTarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tarea_id", nullable = false)
    private Long tareaId;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "usuario_nombre", nullable = false)
    private String usuarioNombre;

    @Column(name = "estado_anterior", nullable = false)
    private String estadoAnterior;

    @Column(name = "estado_nuevo", nullable = false)
    private String estadoNuevo;

    @Column(columnDefinition = "TEXT")
    private String motivo;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    public HistorialCambioTarea() {}

    @PrePersist
    public void prePersist() {
        this.fecha = LocalDateTime.now();
    }
}

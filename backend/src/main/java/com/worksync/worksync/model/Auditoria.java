package com.worksync.worksync.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "auditoria")
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_correo", nullable = false)
    private String usuarioCorreo;

    @Column(name = "usuario_nombre")
    private String usuarioNombre;

    @Column(name = "accion", nullable = false)
    private String accion;

    @Column(columnDefinition = "TEXT")
    private String detalles;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    public Auditoria() {}

    @PrePersist
    public void prePersist() {
        this.fecha = LocalDateTime.now();
    }
}

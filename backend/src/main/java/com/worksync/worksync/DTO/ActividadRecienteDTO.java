package com.worksync.worksync.DTO;

import java.time.LocalDateTime;

public class ActividadRecienteDTO {
    private Long id;
    private Long tareaId;
    private String tareaTitulo;
    private Long usuarioId;
    private String usuarioNombre;
    private String estadoAnterior;
    private String estadoNuevo;
    private String motivo;
    private LocalDateTime fecha;

    public ActividadRecienteDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTareaId() { return tareaId; }
    public void setTareaId(Long tareaId) { this.tareaId = tareaId; }

    public String getTareaTitulo() { return tareaTitulo; }
    public void setTareaTitulo(String tareaTitulo) { this.tareaTitulo = tareaTitulo; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }

    public String getEstadoAnterior() { return estadoAnterior; }
    public void setEstadoAnterior(String estadoAnterior) { this.estadoAnterior = estadoAnterior; }

    public String getEstadoNuevo() { return estadoNuevo; }
    public void setEstadoNuevo(String estadoNuevo) { this.estadoNuevo = estadoNuevo; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
}

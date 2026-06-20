package com.worksync.worksync.DTO;

public class RendimientoColaboradorDTO {
    private Long usuarioId;
    private String usuarioNombre;
    private long resueltasATiempo;
    private long retrasadas;

    public RendimientoColaboradorDTO() {}

    public RendimientoColaboradorDTO(Long usuarioId, String usuarioNombre, long resueltasATiempo, long retrasadas) {
        this.usuarioId = usuarioId;
        this.usuarioNombre = usuarioNombre;
        this.resueltasATiempo = resueltasATiempo;
        this.retrasadas = retrasadas;
    }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }

    public long getResueltasATiempo() { return resueltasATiempo; }
    public void setResueltasATiempo(long resueltasATiempo) { this.resueltasATiempo = resueltasATiempo; }

    public long getRetrasadas() { return retrasadas; }
    public void setRetrasadas(long retrasadas) { this.retrasadas = retrasadas; }
}

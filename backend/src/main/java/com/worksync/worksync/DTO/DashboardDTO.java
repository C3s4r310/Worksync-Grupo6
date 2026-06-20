package com.worksync.worksync.DTO;

import java.util.List;

public class DashboardDTO {
    private long proyectosActivos;
    private long misTareasPendientes;
    private long vencenPronto;
    private List<tareaDTO> tareasCriticas;
    private List<ActividadRecienteDTO> actividadReciente;

    public DashboardDTO() {}

    public long getProyectosActivos() { return proyectosActivos; }
    public void setProyectosActivos(long proyectosActivos) { this.proyectosActivos = proyectosActivos; }

    public long getMisTareasPendientes() { return misTareasPendientes; }
    public void setMisTareasPendientes(long misTareasPendientes) { this.misTareasPendientes = misTareasPendientes; }

    public long getVencenPronto() { return vencenPronto; }
    public void setVencenPronto(long vencenPronto) { this.vencenPronto = vencenPronto; }

    public List<tareaDTO> getTareasCriticas() { return tareasCriticas; }
    public void setTareasCriticas(List<tareaDTO> tareasCriticas) { this.tareasCriticas = tareasCriticas; }

    public List<ActividadRecienteDTO> getActividadReciente() { return actividadReciente; }
    public void setActividadReciente(List<ActividadRecienteDTO> actividadReciente) { this.actividadReciente = actividadReciente; }
}

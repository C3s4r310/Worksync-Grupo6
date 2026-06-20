package com.worksync.worksync.DTO;

import java.util.List;

public class ReporteDashboardDTO {
    private List<DistribucionTareasDTO> distribucionTareas;
    private List<ProgresoProyectoDTO> progresoProyectos;
    private List<RendimientoColaboradorDTO> rendimientoColaboradores;

    public ReporteDashboardDTO() {}

    public ReporteDashboardDTO(
            List<DistribucionTareasDTO> distribucionTareas,
            List<ProgresoProyectoDTO> progresoProyectos,
            List<RendimientoColaboradorDTO> rendimientoColaboradores) {
        this.distribucionTareas = distribucionTareas;
        this.progresoProyectos = progresoProyectos;
        this.rendimientoColaboradores = rendimientoColaboradores;
    }

    public List<DistribucionTareasDTO> getDistribucionTareas() { return distribucionTareas; }
    public void setDistribucionTareas(List<DistribucionTareasDTO> distribucionTareas) { this.distribucionTareas = distribucionTareas; }

    public List<ProgresoProyectoDTO> getProgresoProyectos() { return progresoProyectos; }
    public void setProgresoProyectos(List<ProgresoProyectoDTO> progresoProyectos) { this.progresoProyectos = progresoProyectos; }

    public List<RendimientoColaboradorDTO> getRendimientoColaboradores() { return rendimientoColaboradores; }
    public void setRendimientoColaboradores(List<RendimientoColaboradorDTO> rendimientoColaboradores) { this.rendimientoColaboradores = rendimientoColaboradores; }
}

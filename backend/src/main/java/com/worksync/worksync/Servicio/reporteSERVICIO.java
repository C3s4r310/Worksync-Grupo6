package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.HistorialCambioTareaRepository;
import com.worksync.worksync.DAO.ProyectoRepository;
import com.worksync.worksync.DAO.TareaRepository;
import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.DTO.DistribucionTareasDTO;
import com.worksync.worksync.DTO.ProgresoProyectoDTO;
import com.worksync.worksync.DTO.RendimientoColaboradorDTO;
import com.worksync.worksync.DTO.ReporteDashboardDTO;
import com.worksync.worksync.model.EstadoTarea;
import com.worksync.worksync.model.HistorialCambioTarea;
import com.worksync.worksync.model.Proyecto;
import com.worksync.worksync.model.Tarea;
import com.worksync.worksync.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class reporteSERVICIO {

    @Autowired
    private ProyectoRepository proyectoRepository;

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private HistorialCambioTareaRepository historialRepository;

    @Autowired
    private userDAO usuarioDAO;

    public ReporteDashboardDTO obtenerReporteDashboard() {
        List<Tarea> allTasks = tareaRepository.findByEliminadoLogicamenteFalse();

        // 1. Distribución de Tareas por Estado
        Map<String, Long> countsByEstado = allTasks.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getEstado() != null ? t.getEstado().name() : "PENDIENTE",
                        Collectors.counting()
                ));
        
        List<DistribucionTareasDTO> distribucion = countsByEstado.entrySet().stream()
                .map(entry -> new DistribucionTareasDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // Asegurar que si algún estado no tiene tareas, se muestre con 0 en la gráfica
        for (EstadoTarea est : EstadoTarea.values()) {
            boolean existe = distribucion.stream().anyMatch(d -> d.getEstado().equals(est.name()));
            if (!existe) {
                distribucion.add(new DistribucionTareasDTO(est.name(), 0));
            }
        }

        // 2. Progreso de Proyectos Activos
        List<Proyecto> proyectosActivos = proyectoRepository.findByEstadoAndEliminadoLogicamenteFalse("ACTIVO");
        List<ProgresoProyectoDTO> progresoProyectos = new ArrayList<>();

        for (Proyecto p : proyectosActivos) {
            List<Tarea> tareasDeProyecto = allTasks.stream()
                    .filter(t -> t.getProyectoId() != null && t.getProyectoId().equals(p.getId()))
                    .collect(Collectors.toList());

            int totalTareas = tareasDeProyecto.size();
            long completadas = tareasDeProyecto.stream()
                    .filter(t -> t.getEstado() == EstadoTarea.COMPLETADA)
                    .count();

            double porcentaje = totalTareas > 0 ? ((double) completadas / totalTareas) * 100 : 0.0;
            // Redondear a 1 decimal
            porcentaje = Math.round(porcentaje * 10.0) / 10.0;

            progresoProyectos.add(new ProgresoProyectoDTO(p.getId(), p.getNombre(), porcentaje));
        }

        // 3. Rendimiento por Colaborador (A tiempo vs Retrasadas)
        List<HistorialCambioTarea> completions = historialRepository.findByEstadoNuevo("COMPLETADA");
        // Mapear tareaId -> fecha de finalización más reciente
        Map<Long, LocalDateTime> latestCompletions = completions.stream()
                .collect(Collectors.toMap(
                        HistorialCambioTarea::getTareaId,
                        HistorialCambioTarea::getFecha,
                        (f1, f2) -> f1.isAfter(f2) ? f1 : f2
                ));

        Map<String, List<Tarea>> tasksByResp = allTasks.stream()
                .filter(t -> t.getResponsable() != null && !t.getResponsable().trim().isEmpty())
                .collect(Collectors.groupingBy(Tarea::getResponsable));

        List<RendimientoColaboradorDTO> rendimiento = new ArrayList<>();

        for (Map.Entry<String, List<Tarea>> entry : tasksByResp.entrySet()) {
            String responsableStr = entry.getKey();
            List<Tarea> tareasColaborador = entry.getValue();

            Long usuarioId;
            try {
                usuarioId = Long.parseLong(responsableStr);
            } catch (NumberFormatException e) {
                continue;
            }

            String nombreColaborador = usuarioDAO.findById(usuarioId)
                    .map(Usuario::getNombre)
                    .orElse("Colaborador #" + usuarioId);

            long aTiempo = 0;
            long retrasadas = 0;

            for (Tarea t : tareasColaborador) {
                if (t.getEstado() == EstadoTarea.COMPLETADA) {
                    LocalDateTime fechaCompletado = latestCompletions.get(t.getId());
                    if (fechaCompletado != null) {
                        if (t.getFechaLimite() == null || !fechaCompletado.toLocalDate().isAfter(t.getFechaLimite())) {
                            aTiempo++;
                        } else {
                            retrasadas++;
                        }
                    } else {
                        // Si no hay historial, comparar fecha de creación con fecha límite
                        if (t.getFechaLimite() == null || !t.getFechaCreacion().toLocalDate().isAfter(t.getFechaLimite())) {
                            aTiempo++;
                        } else {
                            retrasadas++;
                        }
                    }
                } else {
                    // Tareas pendientes
                    if (t.getFechaLimite() != null && t.getFechaLimite().isBefore(LocalDate.now())) {
                        retrasadas++;
                    }
                }
            }

            rendimiento.add(new RendimientoColaboradorDTO(usuarioId, nombreColaborador, aTiempo, retrasadas));
        }

        return new ReporteDashboardDTO(distribucion, progresoProyectos, rendimiento);
    }
}

package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.HistorialCambioTareaRepository;
import com.worksync.worksync.DAO.ProyectoRepository;
import com.worksync.worksync.DAO.TareaRepository;
import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.DTO.ActividadRecienteDTO;
import com.worksync.worksync.DTO.DashboardDTO;
import com.worksync.worksync.DTO.tareaDTO;
import com.worksync.worksync.model.EstadoTarea;
import com.worksync.worksync.model.HistorialCambioTarea;
import com.worksync.worksync.model.Prioridad;
import com.worksync.worksync.model.Tarea;
import com.worksync.worksync.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class dashboardSERVICIO {

    @Autowired
    private ProyectoRepository proyectoRepository;

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private HistorialCambioTareaRepository historialRepository;

    @Autowired
    private userDAO usuarioDAO;

    public DashboardDTO obtenerDatosDashboard(String correoUsuarioLogueado) {
        Usuario usuario = usuarioDAO.findByCorreo(correoUsuarioLogueado)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado: " + correoUsuarioLogueado));

        DashboardDTO dto = new DashboardDTO();

        // 1. Proyectos Activos
        long proyectosActivos = proyectoRepository.countActiveProjectsForUser(
                usuario.getNombre(), usuario.getCorreo(), usuario.getId());
        dto.setProyectosActivos(proyectosActivos);

        // 2. Mis Tareas Pendientes
        String responsableIdStr = usuario.getId().toString();
        long pendingCount = tareaRepository.countPendingTasksForUser(responsableIdStr);
        dto.setMisTareasPendientes(pendingCount);

        // 3. Vencen Pronto
        LocalDate limitDate = LocalDate.now().plusDays(3);
        long expiringSoonCount = tareaRepository.countTasksExpiringSoon(responsableIdStr, limitDate);
        dto.setVencenPronto(expiringSoonCount);

        // 4. Lista de Tareas Críticas
        List<Tarea> allPending = tareaRepository.findByResponsableAndEstadoNotAndEliminadoLogicamenteFalse(
                responsableIdStr, EstadoTarea.COMPLETADA);

        // Ordenar por prioridad (CRITICA -> ALTA -> MEDIA -> BAJA) y luego por fecha límite (más cercana primero, nulos al final)
        List<tareaDTO> tareasCriticas = allPending.stream()
                .sorted(Comparator.comparing(Tarea::getPrioridad, this::compararPrioridad).reversed()
                        .thenComparing(Tarea::getFechaLimite, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(5)
                .map(this::convertirTareaADTO)
                .collect(Collectors.toList());
        dto.setTareasCriticas(tareasCriticas);

        // 5. Feed de Actividad Reciente
        List<HistorialCambioTarea> historial = historialRepository.findTop15ByOrderByFechaDesc();
        List<ActividadRecienteDTO> actividades = new ArrayList<>();

        for (HistorialCambioTarea h : historial) {
            ActividadRecienteDTO act = new ActividadRecienteDTO();
            act.setId(h.getId());
            act.setTareaId(h.getTareaId());
            act.setUsuarioId(h.getUsuarioId());
            act.setUsuarioNombre(h.getUsuarioNombre());
            act.setEstadoAnterior(h.getEstadoAnterior());
            act.setEstadoNuevo(h.getEstadoNuevo());
            act.setMotivo(h.getMotivo());
            act.setFecha(h.getFecha());

            // Buscar título de la tarea
            String tituloTarea = tareaRepository.findById(h.getTareaId())
                    .map(Tarea::getTitulo)
                    .orElse("Tarea #" + h.getTareaId() + " (Eliminada)");
            act.setTareaTitulo(tituloTarea);

            actividades.add(act);
        }
        dto.setActividadReciente(actividades);

        return dto;
    }

    // Ponderación de Prioridad: CRITICA(4), ALTA(3), MEDIA(2), BAJA(1)
    private int compararPrioridad(Prioridad p1, Prioridad p2) {
        if (p1 == null && p2 == null) return 0;
        if (p1 == null) return -1;
        if (p2 == null) return 1;

        int w1 = getPrioridadWeight(p1);
        int w2 = getPrioridadWeight(p2);
        return Integer.compare(w1, w2);
    }

    private int getPrioridadWeight(Prioridad p) {
        switch (p) {
            case CRITICA: return 4;
            case ALTA: return 3;
            case MEDIA: return 2;
            case BAJA: return 1;
            default: return 0;
        }
    }

    private tareaDTO convertirTareaADTO(Tarea tarea) {
        tareaDTO dto = new tareaDTO();
        dto.setId(tarea.getId());
        dto.setTitulo(tarea.getTitulo());
        dto.setDescripcion(tarea.getDescripcion());
        dto.setEstado(tarea.getEstado());
        dto.setPrioridad(tarea.getPrioridad());
        dto.setProyectoId(tarea.getProyectoId());
        dto.setFechaLimite(tarea.getFechaLimite());
        dto.setFechaCreacion(tarea.getFechaCreacion());
        dto.setDependencias(tarea.getDependencias());
        dto.setEvidencias(tarea.getEvidencias());
        dto.setTareaPadreId(tarea.getTareaPadreId());
        if (tarea.getResponsable() != null) {
            try {
                dto.setResponsableId(Long.parseLong(tarea.getResponsable()));
            } catch (NumberFormatException ignored) {}
        }
        return dto;
    }
}

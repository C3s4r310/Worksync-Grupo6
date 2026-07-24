package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.ProyectoRepository;
import com.worksync.worksync.DTO.proyectoDTO;
import com.worksync.worksync.model.Proyecto;
import com.worksync.worksync.util.ProyectoSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

// RF-02 Gestión de Proyectos: CRUD de proyectos con fechas y responsables.
// RF-25 Cierre de Proyecto & RF-26 Reapertura: Parcialmente soportados a través de edición de estado (falta validación compleja de tareas pendientes).
@Service
public class proyectoSERVICIO {

    @Autowired
    private ProyectoRepository proyectoRepository;

    @Autowired
    private com.worksync.worksync.DAO.TareaRepository tareaRepository;

    @Autowired
    private AuditoriaServicio auditoriaServicio;

    // RF-02: Crear proyecto
    public proyectoDTO crearProyecto(proyectoDTO dto) {
        Proyecto proyecto = new Proyecto();
        proyecto.setNombre(dto.getNombre());
        proyecto.setDescripcion(dto.getDescripcion());
        proyecto.setEstado(dto.getEstado() != null ? dto.getEstado().toUpperCase() : "ACTIVO");
        proyecto.setFechaInicio(dto.getFechaInicio());
        proyecto.setFechaFin(dto.getFechaFin());
        proyecto.setPrioridad(dto.getPrioridad() != null ? dto.getPrioridad() : "MEDIA");
        proyecto.setResponsable(dto.getResponsable());

        Proyecto guardado = proyectoRepository.save(proyecto);
        
        // RF-28 Auditoría: Loguear creación de proyecto
        auditoriaServicio.registrarEvento("CREAR_PROYECTO", "Se creó el proyecto '" + guardado.getNombre() + "' (ID: " + guardado.getId() + ") con responsable: " + guardado.getResponsable());
        
        return convertirADTO(guardado);
    }

    // RF-02: Listar proyectos activos
    public List<proyectoDTO> listarProyectos() {
        return proyectoRepository.findByEliminadoLogicamenteFalse()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // RF-02: Editar proyecto
    public proyectoDTO editarProyecto(Long id, proyectoDTO dto) {
        Proyecto proyecto = proyectoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con id: " + id));

        boolean editadoInfo = false;

        if (dto.getNombre() != null) { proyecto.setNombre(dto.getNombre()); editadoInfo = true; }
        if (dto.getDescripcion() != null) { proyecto.setDescripcion(dto.getDescripcion()); editadoInfo = true; }
        if (dto.getFechaInicio() != null) { proyecto.setFechaInicio(dto.getFechaInicio()); editadoInfo = true; }
        if (dto.getFechaFin() != null) { proyecto.setFechaFin(dto.getFechaFin()); editadoInfo = true; }
        if (dto.getPrioridad() != null) { proyecto.setPrioridad(dto.getPrioridad()); editadoInfo = true; }
        if (dto.getResponsable() != null) { proyecto.setResponsable(dto.getResponsable()); editadoInfo = true; }

        if (dto.getEstado() != null) {
            String nuevoEstado = dto.getEstado().toUpperCase();
            if ("FINALIZADO".equals(nuevoEstado) && !"FINALIZADO".equals(proyecto.getEstado())) {
                // RF-25 Cierre: Validar que no existan tareas pendientes
                List<com.worksync.worksync.model.Tarea> tareasActivas = tareaRepository.findByProyectoIdAndEliminadoLogicamenteFalse(id)
                        .stream()
                        .filter(t -> t.getEstado() != com.worksync.worksync.model.EstadoTarea.COMPLETADA && t.getEstado() != com.worksync.worksync.model.EstadoTarea.CANCELADA)
                        .collect(Collectors.toList());
                if (!tareasActivas.isEmpty()) {
                    throw new RuntimeException("No se puede cerrar el proyecto porque tiene " + tareasActivas.size() + " tareas activas pendientes.");
                }
                // RF-28 Auditoría: Loguear cierre de proyecto
                auditoriaServicio.registrarEvento("CIERRE_PROYECTO", "Se finalizó/cerró exitosamente el proyecto '" + proyecto.getNombre() + "' (ID: " + id + ")");
            } else if ("ACTIVO".equals(nuevoEstado) && "FINALIZADO".equals(proyecto.getEstado())) {
                // RF-26 Reapertura: Loguear reapertura de proyecto
                auditoriaServicio.registrarEvento("REAPERTURA_PROYECTO", "Se reabrió el proyecto '" + proyecto.getNombre() + "' (ID: " + id + ")");
            } else if (!nuevoEstado.equals(proyecto.getEstado())) {
                auditoriaServicio.registrarEvento("CAMBIAR_ESTADO_PROYECTO", "Se cambió el estado del proyecto '" + proyecto.getNombre() + "' (ID: " + id + ") de " + proyecto.getEstado() + " a " + nuevoEstado);
            }
            proyecto.setEstado(nuevoEstado);
        } else if (editadoInfo) {
            auditoriaServicio.registrarEvento("EDITAR_PROYECTO", "Se editó la información del proyecto '" + proyecto.getNombre() + "' (ID: " + id + ")");
        }

        Proyecto actualizado = proyectoRepository.save(proyecto);
        return convertirADTO(actualizado);
    }

    // RF-02: Eliminación lógica de proyecto
    public void eliminarProyecto(Long id) {
        Proyecto proyecto = proyectoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con id: " + id));
        proyecto.setEliminadoLogicamente(true);
        proyectoRepository.save(proyecto);
        
        // RF-28 Auditoría: Loguear eliminación
        auditoriaServicio.registrarEvento("ELIMINAR_PROYECTO", "Se eliminó lógicamente el proyecto '" + proyecto.getNombre() + "' (ID: " + id + ")");
    }

    // Verifica si un proyecto existe (usado por tareaSERVICIO)
    public boolean existeProyecto(Long proyectoId) {
        return proyectoRepository.existsById(proyectoId);
    }

    // RF-24 y RNF-01: Búsqueda, filtros y paginación para Proyectos
    public Page<proyectoDTO> buscarYFiltrarProyectos(
            String estado, LocalDate fechaInicio, String palabraClave, Pageable pageable) {

        Specification<Proyecto> spec = ProyectoSpecification.filtrarProyectos(estado, fechaInicio, palabraClave);
        Page<Proyecto> proyectosFiltrados = proyectoRepository.findAll(spec, pageable);

        return proyectosFiltrados.map(this::convertirADTO);
    }

    // Convierte entidad a DTO
    private proyectoDTO convertirADTO(Proyecto proyecto) {
        proyectoDTO dto = new proyectoDTO();
        dto.setId(proyecto.getId());
        dto.setNombre(proyecto.getNombre());
        dto.setDescripcion(proyecto.getDescripcion());
        dto.setEstado(proyecto.getEstado());
        dto.setFechaInicio(proyecto.getFechaInicio());
        dto.setFechaFin(proyecto.getFechaFin());
        dto.setPrioridad(proyecto.getPrioridad());
        dto.setResponsable(proyecto.getResponsable());
        return dto;
    }
}
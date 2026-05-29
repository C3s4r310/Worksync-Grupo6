package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.TareaRepository;
import com.worksync.worksync.DTO.tareaDTO;
import com.worksync.worksync.model.Tarea;
import com.worksync.worksync.util.TareaSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class tareaSERVICIO {

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private proyectoSERVICIO proyectoServicio;

    // RF-03: Crear tarea dentro de un proyecto
    public tareaDTO crear(tareaDTO dto) {
        if (dto.getProyectoId() == null || !proyectoServicio.existeProyecto(dto.getProyectoId())) {
            throw new RuntimeException("El proyecto con id " + dto.getProyectoId() + " no existe.");
        }
        if (dto.getPrioridad() == null) {
            throw new RuntimeException("La prioridad es obligatoria. Valores válidos: BAJA, MEDIA, ALTA, CRITICA.");
        }

        Tarea tarea = new Tarea();
        tarea.setTitulo(dto.getTitulo());
        tarea.setDescripcion(dto.getDescripcion());
        tarea.setEstado("PENDIENTE");
        tarea.setPrioridad(dto.getPrioridad());
        tarea.setResponsable(dto.getResponsableId() != null ? dto.getResponsableId().toString() : null);
        tarea.setProyectoId(dto.getProyectoId());
        tarea.setFechaLimite(dto.getFechaLimite());

        if (dto.getDependencias() != null) tarea.setDependencias(dto.getDependencias());
        if (dto.getEvidencias() != null) tarea.setEvidencias(dto.getEvidencias());

        Tarea guardada = tareaRepository.save(tarea);
        return convertirADTO(guardada);
    }

    // RF-03: Obtener tarea por id
    public tareaDTO obtenerPorId(Long id) {
        Tarea tarea = tareaRepository.findByIdAndEliminadoLogicamenteFalse(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + id));
        return convertirADTO(tarea);
    }

    // RF-03: Listar tareas de un proyecto
    public List<tareaDTO> listarPorProyecto(Long proyectoId) {
        if (!proyectoServicio.existeProyecto(proyectoId)) {
            throw new RuntimeException("El proyecto con id " + proyectoId + " no existe.");
        }
        return tareaRepository.findByProyectoIdAndEliminadoLogicamenteFalse(proyectoId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // RF-03: Actualizar tarea
    public tareaDTO actualizar(Long id, tareaDTO dto) {
        Tarea tarea = tareaRepository.findByIdAndEliminadoLogicamenteFalse(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + id));

        if (dto.getTitulo() != null) tarea.setTitulo(dto.getTitulo());
        if (dto.getDescripcion() != null) tarea.setDescripcion(dto.getDescripcion());
        if (dto.getPrioridad() != null) tarea.setPrioridad(dto.getPrioridad()); 
        if (dto.getEstado() != null) tarea.setEstado(dto.getEstado());
        if (dto.getFechaLimite() != null) tarea.setFechaLimite(dto.getFechaLimite());
        if (dto.getDependencias() != null) tarea.setDependencias(dto.getDependencias());
        if (dto.getEvidencias() != null) tarea.setEvidencias(dto.getEvidencias());

        Tarea actualizada = tareaRepository.save(tarea);
        return convertirADTO(actualizada);
    }

    // RF-03: Eliminación lógica
    public void eliminarLogicamente(Long id) {
        Tarea tarea = tareaRepository.findByIdAndEliminadoLogicamenteFalse(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + id));
        tarea.setEliminadoLogicamente(true);
        tareaRepository.save(tarea);
    }

    // RF-05: Actualizar solo el estado
    public tareaDTO actualizarEstado(Long id, String nuevoEstado) {
        Tarea tarea = tareaRepository.findByIdAndEliminadoLogicamenteFalse(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + id));
        tarea.setEstado(nuevoEstado);
        Tarea actualizada = tareaRepository.save(tarea);
        return convertirADTO(actualizada);
    }

    // RF-24 y RNF-01: Búsqueda, filtros y paginación
    public Page<tareaDTO> buscarYFiltrarTareas(
            Long proyectoId, String estado, String prioridad, 
            String responsable, LocalDate fechaLimite, String palabraClave, 
            Pageable pageable) {
        
        Specification<Tarea> spec = TareaSpecification.filtrarTareas(
                proyectoId, estado, prioridad, responsable, fechaLimite, palabraClave);
        
        Page<Tarea> tareasFiltradas = tareaRepository.findAll(spec, pageable);
        
        return tareasFiltradas.map(this::convertirADTO);
    }

    // Conversión entidad → DTO
    private tareaDTO convertirADTO(Tarea tarea) {
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
        return dto;
    }
}
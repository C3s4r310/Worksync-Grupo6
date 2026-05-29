package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.ProyectoRepository;
import com.worksync.worksync.DTO.proyectoDTO;
import com.worksync.worksync.model.Proyecto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class proyectoSERVICIO {
    @Autowired
    private ProyectoRepository proyectoRepository;

    // RF-02: Crear proyecto
    public proyectoDTO crearProyecto(proyectoDTO dto) {
        Proyecto proyecto = new Proyecto();
        proyecto.setNombre(dto.getNombre());
        proyecto.setDescripcion(dto.getDescripcion());
        proyecto.setEstado(dto.getEstado() != null ? dto.getEstado() : "ACTIVO");
        proyecto.setFechaInicio(dto.getFechaInicio());
        proyecto.setFechaFin(dto.getFechaFin());

        Proyecto guardado = proyectoRepository.save(proyecto);
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

        if (dto.getNombre() != null) proyecto.setNombre(dto.getNombre());
        if (dto.getDescripcion() != null) proyecto.setDescripcion(dto.getDescripcion());
        if (dto.getEstado() != null) proyecto.setEstado(dto.getEstado());
        if (dto.getFechaInicio() != null) proyecto.setFechaInicio(dto.getFechaInicio());
        if (dto.getFechaFin() != null) proyecto.setFechaFin(dto.getFechaFin());

        Proyecto actualizado = proyectoRepository.save(proyecto);
        return convertirADTO(actualizado);
    }

    // Verifica si un proyecto existe (usado por tareaSERVICIO)
    public boolean existeProyecto(Long proyectoId) {
        return proyectoRepository.existsById(proyectoId);
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
        return dto;
    }
    // RF-02 + RNF-06: Eliminación lógica
    public void eliminarProyecto(Long id) {
    Proyecto proyecto = proyectoRepository.findById(id) 
    .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con id: " + id));    
    proyecto.setEliminadoLogicamente(true);

    proyectoRepository.save(proyecto);
    }

    // RF-02: Cerrar proyecto
    public proyectoDTO cerrarProyecto(Long id) {
        Proyecto proyecto = proyectoRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Proyecto no encontrado con id: " + id));
        proyecto.setEstado("CERRADO");
        Proyecto actualizado = proyectoRepository.save(proyecto);
        return convertirADTO(actualizado);
        
    }
}

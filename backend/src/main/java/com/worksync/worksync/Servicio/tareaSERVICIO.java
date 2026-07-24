package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.TareaRepository;
import com.worksync.worksync.DAO.MiembroProyectoRepository;
import com.worksync.worksync.DTO.tareaDTO;
import com.worksync.worksync.model.EstadoTarea;
import com.worksync.worksync.model.MiembroProyecto;
import com.worksync.worksync.model.Rol;
import com.worksync.worksync.model.Tarea;
import com.worksync.worksync.util.TareaSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.worksync.worksync.DAO.HistorialCambioTareaRepository;
import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.model.HistorialCambioTarea;
import com.worksync.worksync.model.Usuario;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

// RF-03 Gestión de Tareas: CRUD básico de tareas.
// RF-04 Asignación Inteligente: Asignación de tareas validando carga y rol (máximo 3 tareas activas por COLABORADOR).
// RF-05 Control de Estados: Cambio de estados con máquina de estados y registro de bitácora.
// RF-11 Dependencias & RF-13 Bloqueos: Control de prerrequisitos antes de iniciar/completar una tarea.
// RF-14 Priorización: Manejo de prioridades (CRÍTICA, ALTA, MEDIA, BAJA).
// RF-15 Subtareas: Desglose y relación jerárquica de tareas principales y subtareas.
// RF-17 Historial: Registro cronológico de cambios de estado y motivos.
@Service
@Transactional
public class tareaSERVICIO {

    private static final int MAX_TAREAS_POR_COLABORADOR = 3;

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private proyectoSERVICIO proyectoServicio;

    @Autowired
    private MiembroProyectoRepository miembroRepository;

    @Autowired
    private HistorialCambioTareaRepository historialRepository;

    @Autowired
    private userDAO usuarioDAO;

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
        tarea.setEstado(EstadoTarea.PENDIENTE);
        tarea.setPrioridad(dto.getPrioridad());
        tarea.setProyectoId(dto.getProyectoId());
        tarea.setFechaLimite(dto.getFechaLimite());

        // RF-04: Si viene responsable, validar antes de asignar
        if (dto.getResponsableId() != null) {
            validarAsignacion(dto.getProyectoId(), dto.getResponsableId());
            tarea.setResponsable(dto.getResponsableId().toString());
        }

        if (dto.getDependencias() != null) tarea.setDependencias(dto.getDependencias());
        if (dto.getEvidencias() != null) tarea.setEvidencias(dto.getEvidencias());

        // RF-15: Asignar tarea padre si es subtarea
        if (dto.getTareaPadreId() != null) {
            Tarea padre = tareaRepository.findByIdAndEliminadoLogicamenteFalse(dto.getTareaPadreId())
                    .orElseThrow(() -> new RuntimeException("La tarea padre con id " + dto.getTareaPadreId() + " no existe."));
            if (!padre.getProyectoId().equals(dto.getProyectoId())) {
                throw new RuntimeException("La tarea padre debe pertenecer al mismo proyecto.");
            }
            tarea.setTareaPadreId(dto.getTareaPadreId());
        }

        return convertirADTO(tareaRepository.save(tarea));
    }

    // RF-04: Asignar o reasignar responsable a una tarea existente
    public tareaDTO asignarResponsable(Long tareaId, Long usuarioId) {
        Tarea tarea = tareaRepository.findByIdAndEliminadoLogicamenteFalse(tareaId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + tareaId));

        validarAsignacion(tarea.getProyectoId(), usuarioId);

        tarea.setResponsable(usuarioId.toString());
        return convertirADTO(tareaRepository.save(tarea));
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

    // Listar subtareas de una tarea padre
    public List<tareaDTO> listarSubtareas(Long padreId) {
        return tareaRepository.findByTareaPadreIdAndEliminadoLogicamenteFalse(padreId)
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

        // Validar cambio de estado si se incluye en la actualización general
        if (dto.getEstado() != null && !dto.getEstado().equals(tarea.getEstado())) {
            validarTransicionYRequisitos(tarea, dto.getEstado());
            registrarHistorialCambio(tarea, dto.getEstado(), "Actualización general de tarea.");
            tarea.setEstado(dto.getEstado());
        }

        if (dto.getFechaLimite() != null) tarea.setFechaLimite(dto.getFechaLimite());
        if (dto.getDependencias() != null) tarea.setDependencias(dto.getDependencias());
        if (dto.getEvidencias() != null) tarea.setEvidencias(dto.getEvidencias());

        // RF-04: Si cambia el responsable, validar asignación
        if (dto.getResponsableId() != null) {
            validarAsignacion(tarea.getProyectoId(), dto.getResponsableId());
            tarea.setResponsable(dto.getResponsableId().toString());
        }

        // RF-15: Actualizar tarea padre si aplica
        if (dto.getTareaPadreId() != null) {
            if (dto.getTareaPadreId().equals(tarea.getId())) {
                throw new RuntimeException("Una tarea no puede ser subtarea de sí misma.");
            }
            Tarea padre = tareaRepository.findByIdAndEliminadoLogicamenteFalse(dto.getTareaPadreId())
                    .orElseThrow(() -> new RuntimeException("La tarea padre con id " + dto.getTareaPadreId() + " no existe."));
            if (!padre.getProyectoId().equals(tarea.getProyectoId())) {
                throw new RuntimeException("La tarea padre debe pertenecer al mismo proyecto.");
            }
            tarea.setTareaPadreId(dto.getTareaPadreId());
        }

        return convertirADTO(tareaRepository.save(tarea));
    }

    // RF-03: Eliminación lógica
    public void eliminarLogicamente(Long id) {
        Tarea tarea = tareaRepository.findByIdAndEliminadoLogicamenteFalse(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + id));
        tarea.setEliminadoLogicamente(true);
        tareaRepository.save(tarea);
    }

    // RF-05: Actualizar solo el estado — valida que sea un valor permitido y registra historial
    public tareaDTO actualizarEstado(Long id, String nuevoEstado, String motivo) {
        Tarea tarea = tareaRepository.findByIdAndEliminadoLogicamenteFalse(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + id));

        EstadoTarea estado;
        try {
            estado = EstadoTarea.valueOf(nuevoEstado.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(
                    "Estado inválido: '" + nuevoEstado + "'. " +
                            "Valores válidos: PENDIENTE, EN_PROGRESO, BLOQUEADA, EN_REVISION, OBSERVADA, COMPLETADA, CANCELADA.");
        }

        validarTransicionYRequisitos(tarea, estado);
        registrarHistorialCambio(tarea, estado, motivo);

        tarea.setEstado(estado);
        return convertirADTO(tareaRepository.save(tarea));
    }

    // Registrar cambio de estado en la bitácora
    private void registrarHistorialCambio(Tarea tarea, EstadoTarea nuevoEstado, String motivo) {
        String estadoAnteriorStr = tarea.getEstado() != null ? tarea.getEstado().name() : "N/A";

        // Obtener usuario autenticado
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioDAO.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado en base de datos."));

        HistorialCambioTarea historial = new HistorialCambioTarea();
        historial.setTareaId(tarea.getId());
        historial.setUsuarioId(usuario.getId());
        historial.setUsuarioNombre(usuario.getNombre());
        historial.setEstadoAnterior(estadoAnteriorStr);
        historial.setEstadoNuevo(nuevoEstado.name());
        historial.setMotivo(motivo != null && !motivo.trim().isEmpty() ? motivo : "Cambio de estado.");
        historialRepository.save(historial);
    }

    // RF-05: Máquina de estados y validación de requisitos
    private void validarTransicionYRequisitos(Tarea tarea, EstadoTarea nuevoEstado) {
        EstadoTarea estadoAnterior = tarea.getEstado();
        if (estadoAnterior == nuevoEstado) return;

        // 1. Validar máquina de estados
        if (!esTransicionValida(estadoAnterior, nuevoEstado)) {
            throw new RuntimeException("Transición de estado inválida de " + (estadoAnterior != null ? estadoAnterior.name() : "N/A") + " a " + nuevoEstado.name() + ".");
        }

        // 2. Si se mueve a EN_PROGRESO o COMPLETADA, validar dependencias (RF-11/RF-13)
        if (nuevoEstado == EstadoTarea.EN_PROGRESO || nuevoEstado == EstadoTarea.COMPLETADA) {
            if (tarea.getDependencias() != null && !tarea.getDependencias().isEmpty()) {
                for (Long depId : tarea.getDependencias()) {
                    Tarea dep = tareaRepository.findByIdAndEliminadoLogicamenteFalse(depId).orElse(null);
                    if (dep != null && dep.getEstado() != EstadoTarea.COMPLETADA && dep.getEstado() != EstadoTarea.CANCELADA) {
                        throw new RuntimeException("No se puede iniciar/completar la tarea porque tiene una dependencia pendiente: '" + dep.getTitulo() + "' (ID: " + depId + ") en estado " + dep.getEstado() + ".");
                    }
                }
            }
        }

        // 3. Si se mueve a COMPLETADA, validar subtareas (RF-15)
        if (nuevoEstado == EstadoTarea.COMPLETADA) {
            List<Tarea> subtareas = tareaRepository.findByTareaPadreIdAndEliminadoLogicamenteFalse(tarea.getId());
            for (Tarea sub : subtareas) {
                if (sub.getEstado() != EstadoTarea.COMPLETADA && sub.getEstado() != EstadoTarea.CANCELADA) {
                    throw new RuntimeException("No se puede completar la tarea principal porque tiene la subtarea '" + sub.getTitulo() + "' (ID: " + sub.getId() + ") pendiente.");
                }
            }
        }
    }

    // Reglas de la máquina de estados
    private boolean esTransicionValida(EstadoTarea anterior, EstadoTarea nuevo) {
        if (anterior == nuevo) return true;
        if (anterior == null) return true;
        switch (anterior) {
            case PENDIENTE:
                return nuevo == EstadoTarea.EN_PROGRESO || nuevo == EstadoTarea.CANCELADA || nuevo == EstadoTarea.BLOQUEADA;
            case EN_PROGRESO:
                return nuevo == EstadoTarea.PENDIENTE || nuevo == EstadoTarea.BLOQUEADA || nuevo == EstadoTarea.EN_REVISION || nuevo == EstadoTarea.CANCELADA;
            case BLOQUEADA:
                return nuevo == EstadoTarea.EN_PROGRESO || nuevo == EstadoTarea.CANCELADA || nuevo == EstadoTarea.PENDIENTE;
            case EN_REVISION:
                return nuevo == EstadoTarea.COMPLETADA || nuevo == EstadoTarea.OBSERVADA || nuevo == EstadoTarea.EN_PROGRESO;
            case OBSERVADA:
                return nuevo == EstadoTarea.EN_PROGRESO || nuevo == EstadoTarea.CANCELADA;
            case COMPLETADA:
                return nuevo == EstadoTarea.EN_REVISION; // Reabrir
            case CANCELADA:
                return nuevo == EstadoTarea.PENDIENTE; // Reactivar
            default:
                return false;
        }
    }

    // RF-05: Obtener historial de cambios de estado de una tarea
    public List<HistorialCambioTarea> obtenerHistorial(Long tareaId) {
        if (!tareaRepository.existsById(tareaId)) {
            throw new RuntimeException("Tarea no encontrada con id: " + tareaId);
        }
        return historialRepository.findByTareaIdOrderByFechaDesc(tareaId);
    }

    // RF-24: Búsqueda, filtros y paginación
    public Page<tareaDTO> buscarYFiltrarTareas(
            Long proyectoId, String estado, String prioridad,
            String responsable, LocalDate fechaLimite, String palabraClave,
            Pageable pageable) {
        Specification<Tarea> spec = TareaSpecification.filtrarTareas(
                proyectoId, estado, prioridad, responsable, fechaLimite, palabraClave);
        return tareaRepository.findAll(spec, pageable).map(this::convertirADTO);
    }

    // RF-04: Validaciones de asignación inteligente
    private void validarAsignacion(Long proyectoId, Long usuarioId) {

        // 1. Validar que el usuario es miembro activo del proyecto
        MiembroProyecto miembro = miembroRepository
                .findByProyectoIdAndUsuarioIdAndActivoTrue(proyectoId, usuarioId)
                .orElseThrow(() -> new RuntimeException(
                        "El usuario no es miembro activo del proyecto. Agrégalo primero."));

        // 2. Validar que tiene rol COLABORADOR dentro del proyecto
        if (miembro.getRol() != Rol.COLABORADOR) {
            throw new RuntimeException(
                    "Solo se puede asignar tareas a usuarios con rol COLABORADOR dentro del proyecto.");
        }

        // 3. Validar carga de trabajo — máximo 3 tareas activas
        int tareasActivas = tareaRepository
                .contarTareasActivasPorResponsable(usuarioId.toString(), proyectoId);

        if (tareasActivas >= MAX_TAREAS_POR_COLABORADOR) {
            throw new RuntimeException(
                    "El colaborador ya tiene " + tareasActivas + " tareas activas. " +
                            "Máximo permitido: " + MAX_TAREAS_POR_COLABORADOR + ".");
        }
    }

    public Tarea agregarEvidencia(Long tareaId, String url) {
        Tarea tarea = tareaRepository.findByIdAndEliminadoLogicamenteFalse(tareaId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + tareaId));
        tarea.getEvidencias().add(url);
        return tareaRepository.save(tarea);
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
        dto.setDependencias(tarea.getDependencias() != null ? new java.util.ArrayList<>(tarea.getDependencias()) : null);
        dto.setEvidencias(tarea.getEvidencias() != null ? new java.util.ArrayList<>(tarea.getEvidencias()) : null);
        dto.setTareaPadreId(tarea.getTareaPadreId());
        if (tarea.getResponsable() != null) {
            try {
                dto.setResponsableId(Long.parseLong(tarea.getResponsable()));
            } catch (NumberFormatException ignored) {}
        }
        return dto;
    }
}
package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.MiembroProyectoRepository;
import com.worksync.worksync.DAO.ProyectoRepository;
import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.DTO.miembroDTO;
import com.worksync.worksync.model.MiembroProyecto;
import com.worksync.worksync.model.Rol;
import com.worksync.worksync.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

// RF-09 Miembros del Proyecto: Asignación de usuarios a proyectos.
@Service
public class miembroSERVICIO {

    @Autowired
    private MiembroProyectoRepository miembroRepository;

    @Autowired
    private ProyectoRepository proyectoRepository;

    @Autowired
    private userDAO usuarioDAO;

    @Autowired
    private AuditoriaServicio auditoriaServicio;

    // RF-09: Agregar miembro a un proyecto
    public miembroDTO agregarMiembro(Long proyectoId, Long usuarioId, String rol) {

        // Validar que el proyecto existe
        if (!proyectoRepository.existsById(proyectoId)) {
            throw new RuntimeException("Proyecto no encontrado con id: " + proyectoId);
        }

        // Validar que el usuario existe
        Usuario usuario = usuarioDAO.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + usuarioId));

        // Validar el rol (solo LIDER o COLABORADOR dentro de un proyecto)
        Rol rolEnum;
        try {
            rolEnum = Rol.valueOf(rol.toUpperCase());
            if (rolEnum == Rol.ADMIN) {
                throw new RuntimeException("El rol ADMIN no puede asignarse dentro de un proyecto. Use LIDER o COLABORADOR.");
            }
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rol inválido. Use LIDER o COLABORADOR.");
        }

        // Verificar si ya existe la relación
        miembroRepository.findByProyectoIdAndUsuarioId(proyectoId, usuarioId).ifPresent(m -> {
            if (m.isActivo()) {
                throw new RuntimeException("El usuario ya es miembro activo de este proyecto.");
            } else {
                // Si existía pero fue retirado, reactivarlo
                m.setActivo(true);
                m.setRol(rolEnum);
                miembroRepository.save(m);
                // RF-28 Auditoría: Loguear reactivación de miembro
                auditoriaServicio.registrarEvento("AGREGAR_MIEMBRO", "Se reactivó al miembro '" + usuario.getNombre() + "' (ID: " + usuarioId + ") en el proyecto ID: " + proyectoId + " con el rol: " + rolEnum.name());
            }
        });

        // Si no existía, crear nuevo
        if (miembroRepository.findByProyectoIdAndUsuarioId(proyectoId, usuarioId).isEmpty()) {
            MiembroProyecto miembro = new MiembroProyecto();
            miembro.setProyectoId(proyectoId);
            miembro.setUsuarioId(usuarioId);
            miembro.setRol(rolEnum);
            miembroRepository.save(miembro);
            // RF-28 Auditoría: Loguear adición de miembro
            auditoriaServicio.registrarEvento("AGREGAR_MIEMBRO", "Se agregó al miembro '" + usuario.getNombre() + "' (ID: " + usuarioId + ") al proyecto ID: " + proyectoId + " con el rol: " + rolEnum.name());
        }

        MiembroProyecto guardado = miembroRepository
                .findByProyectoIdAndUsuarioIdAndActivoTrue(proyectoId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Error al agregar miembro."));

        return convertirADTO(guardado, usuario);
    }

    // RF-09: Retirar miembro de un proyecto (baja lógica)
    public void retirarMiembro(Long proyectoId, Long usuarioId) {
        MiembroProyecto miembro = miembroRepository
                .findByProyectoIdAndUsuarioIdAndActivoTrue(proyectoId, usuarioId)
                .orElseThrow(() -> new RuntimeException("El usuario no es miembro activo de este proyecto."));

        miembro.setActivo(false);
        miembroRepository.save(miembro);

        // RF-28 Auditoría: Loguear remoción de miembro
        Usuario usuario = usuarioDAO.findById(usuarioId).orElse(null);
        String nombre = usuario != null ? usuario.getNombre() : "ID: " + usuarioId;
        auditoriaServicio.registrarEvento("RETIRAR_MIEMBRO", "Se retiró al miembro '" + nombre + "' (ID: " + usuarioId + ") del proyecto ID: " + proyectoId);
    }

    // RF-09: Listar miembros activos de un proyecto
    public List<miembroDTO> listarMiembros(Long proyectoId) {
        if (!proyectoRepository.existsById(proyectoId)) {
            throw new RuntimeException("Proyecto no encontrado con id: " + proyectoId);
        }

        return miembroRepository.findByProyectoIdAndActivoTrue(proyectoId)
                .stream()
                .map(m -> {
                    Usuario usuario = usuarioDAO.findById(m.getUsuarioId()).orElse(null);
                    return convertirADTO(m, usuario);
                })
                .collect(Collectors.toList());
    }

    // Verifica si un usuario es miembro activo de un proyecto (usado por tareaSERVICIO en RF-04)
    public boolean esMiembro(Long proyectoId, Long usuarioId) {
        return miembroRepository
                .findByProyectoIdAndUsuarioIdAndActivoTrue(proyectoId, usuarioId)
                .isPresent();
    }

    // Conversión entidad → DTO
    private miembroDTO convertirADTO(MiembroProyecto miembro, Usuario usuario) {
        miembroDTO dto = new miembroDTO();
        dto.setId(miembro.getId());
        dto.setProyectoId(miembro.getProyectoId());
        dto.setUsuarioId(miembro.getUsuarioId());
        dto.setRol(miembro.getRol().name());
        dto.setFechaIngreso(miembro.getFechaIngreso());
        dto.setActivo(miembro.isActivo());
        if (usuario != null) {
            dto.setNombreUsuario(usuario.getNombre());
            dto.setCorreoUsuario(usuario.getCorreo());
        }
        return dto;
    }
}
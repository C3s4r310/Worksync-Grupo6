package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.MiembroProyectoRepository;
import com.worksync.worksync.DAO.ProyectoRepository;
import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.DAO.MensajeRepository;
import com.worksync.worksync.DTO.MiembroChatDTO;
import com.worksync.worksync.DTO.ProyectoMiembrosChatDTO;
import com.worksync.worksync.model.MiembroProyecto;
import com.worksync.worksync.model.Proyecto;
import com.worksync.worksync.model.Usuario;
import com.worksync.worksync.model.Rol;
import com.worksync.worksync.model.Mensaje;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class mensajeSERVICIO {

    @Autowired
    private userDAO usuarioDAO;

    @Autowired
    private ProyectoRepository proyectoRepository;

    @Autowired
    private MiembroProyectoRepository miembroRepository;

    @Autowired
    private MensajeRepository mensajeRepository;

    @Transactional
    public List<ProyectoMiembrosChatDTO> obtenerContactosAgrupadosPorProyecto(String correoUsuarioAutenticado) {
        Usuario usuarioAutenticado = usuarioDAO.findByCorreo(correoUsuarioAutenticado)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado: " + correoUsuarioAutenticado));

        // Actualizar marca de última conexión
        usuarioAutenticado.setUltimaConexion(LocalDateTime.now());
        usuarioDAO.save(usuarioAutenticado);

        List<Proyecto> proyectos;
        if (usuarioAutenticado.getRol() == Rol.ADMIN) {
            proyectos = proyectoRepository.findByEliminadoLogicamenteFalse();
        } else {
            // Obtener IDs de proyectos donde es miembro activo
            List<Long> projectIdsFromMemberships = miembroRepository.findByUsuarioIdAndActivoTrue(usuarioAutenticado.getId())
                    .stream()
                    .map(MiembroProyecto::getProyectoId)
                    .collect(Collectors.toList());

            // Obtener todos los proyectos no eliminados
            List<Proyecto> todosProyectos = proyectoRepository.findByEliminadoLogicamenteFalse();

            // Filtrar proyectos donde es miembro OR responsable
            proyectos = todosProyectos.stream()
                    .filter(p -> projectIdsFromMemberships.contains(p.getId()) ||
                            (p.getResponsable() != null &&
                                    (p.getResponsable().equalsIgnoreCase(usuarioAutenticado.getNombre()) ||
                                     p.getResponsable().equalsIgnoreCase(usuarioAutenticado.getCorreo()))))
                    .collect(Collectors.toList());
        }

        List<ProyectoMiembrosChatDTO> resultado = new ArrayList<>();

        for (Proyecto proyecto : proyectos) {
            List<MiembroProyecto> miembrosProyecto = miembroRepository.findByProyectoIdAndActivoTrue(proyecto.getId());
            List<MiembroChatDTO> miembrosChat = new ArrayList<>();
            Set<Long> addedUserIds = new HashSet<>();

            // 1. Añadir miembros desde la relación MiembroProyecto
            for (MiembroProyecto mp : miembrosProyecto) {
                Usuario u = usuarioDAO.findById(mp.getUsuarioId()).orElse(null);
                if (u != null) {
                    if (!u.getId().equals(usuarioAutenticado.getId())) {
                        miembrosChat.add(new MiembroChatDTO(
                                u.getId(),
                                u.getNombre(),
                                u.getCorreo(),
                                mp.getRol().name(),
                                u.getUltimaConexion() != null,
                                u.getUltimaConexion()
                        ));
                        addedUserIds.add(u.getId());
                    }
                }
            }

            // 2. Añadir el responsable del proyecto si no está ya en la lista y no es el usuario autenticado
            if (proyecto.getResponsable() != null && !proyecto.getResponsable().isEmpty()) {
                Usuario respUser = usuarioDAO.findByCorreo(proyecto.getResponsable()).orElse(null);
                if (respUser == null) {
                    // Buscar por nombre
                    respUser = usuarioDAO.findAll().stream()
                            .filter(u -> u.getNombre().equalsIgnoreCase(proyecto.getResponsable()))
                            .findFirst().orElse(null);
                }

                if (respUser != null && !respUser.getId().equals(usuarioAutenticado.getId()) && !addedUserIds.contains(respUser.getId())) {
                    miembrosChat.add(new MiembroChatDTO(
                            respUser.getId(),
                            respUser.getNombre(),
                            respUser.getCorreo(),
                            "LIDER",
                            respUser.getUltimaConexion() != null,
                            respUser.getUltimaConexion()
                    ));
                }
            }

            // Solo agregar el proyecto si tiene otros miembros con los que chatear
            if (!miembrosChat.isEmpty()) {
                resultado.add(new ProyectoMiembrosChatDTO(
                        proyecto.getId(),
                        proyecto.getNombre(),
                        miembrosChat
                ));
            }
        }

        return resultado;
    }

    @Transactional
    public List<Mensaje> obtenerHistorial(Long emisorId, Long receptorId) {
        List<Mensaje> historial = mensajeRepository.findChatHistory(emisorId, receptorId);

        // Marcar como leídos los mensajes que van dirigidos al emisor (el usuario logueado en este contexto)
        boolean modificado = false;
        for (Mensaje m : historial) {
            if (m.getReceptorId().equals(emisorId) && !m.isLeido()) {
                m.setLeido(true);
                modificado = true;
            }
        }

        if (modificado) {
            mensajeRepository.saveAll(historial);
        }

        return historial;
    }

    @Transactional
    public Mensaje enviarMensaje(Long emisorId, Long receptorId, Long proyectoId, String contenido) {
        if (contenido == null || contenido.trim().isEmpty()) {
            throw new RuntimeException("El contenido del mensaje no puede estar vacío.");
        }

        // Validar existencia de emisor y receptor
        if (!usuarioDAO.existsById(emisorId)) {
            throw new RuntimeException("El emisor no existe.");
        }
        if (!usuarioDAO.existsById(receptorId)) {
            throw new RuntimeException("El receptor no existe.");
        }

        Mensaje mensaje = new Mensaje();
        mensaje.setEmisorId(emisorId);
        mensaje.setReceptorId(receptorId);
        mensaje.setProyectoId(proyectoId);
        mensaje.setContenido(contenido);
        // prePersist se encargará de setear fechaEnvio a LocalDateTime.now()
        
        return mensajeRepository.save(mensaje);
    }
}

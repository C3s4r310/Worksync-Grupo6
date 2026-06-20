package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.ComentarioRepository;
import com.worksync.worksync.DAO.TareaRepository;
import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.DTO.comentarioDTO;
import com.worksync.worksync.model.Comentario;
import com.worksync.worksync.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class comentarioSERVICIO {

    @Autowired
    private ComentarioRepository comentarioRepository;

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private userDAO usuarioDAO;

    public comentarioDTO crearComentario(Long tareaId, comentarioDTO dto) {
        if (!tareaRepository.existsById(tareaId)) {
            throw new RuntimeException("La tarea con id " + tareaId + " no existe.");
        }

        // Obtener usuario autenticado
        String correo = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioDAO.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado."));

        Comentario comentario = new Comentario();
        comentario.setTareaId(tareaId);
        comentario.setUsuarioId(usuario.getId());
        comentario.setContenido(dto.getContenido());
        comentario.setFechaCreacion(LocalDateTime.now());

        Comentario guardado = comentarioRepository.save(comentario);

        comentarioDTO resultado = new comentarioDTO();
        resultado.setId(guardado.getId());
        resultado.setTareaId(guardado.getTareaId());
        resultado.setUsuarioId(guardado.getUsuarioId());
        resultado.setUsuarioNombre(usuario.getNombre());
        resultado.setContenido(guardado.getContenido());
        resultado.setFechaCreacion(guardado.getFechaCreacion());

        return resultado;
    }

    public List<comentarioDTO> listarPorTarea(Long tareaId) {
        if (!tareaRepository.existsById(tareaId)) {
            throw new RuntimeException("La tarea con id " + tareaId + " no existe.");
        }

        List<Comentario> comentarios = comentarioRepository.findByTareaIdOrderByFechaCreacionAsc(tareaId);

        return comentarios.stream().map(c -> {
            comentarioDTO d = new comentarioDTO();
            d.setId(c.getId());
            d.setTareaId(c.getTareaId());
            d.setUsuarioId(c.getUsuarioId());
            d.setContenido(c.getContenido());
            d.setFechaCreacion(c.getFechaCreacion());

            // Buscar el nombre del usuario
            usuarioDAO.findById(c.getUsuarioId()).ifPresent(u -> d.setUsuarioNombre(u.getNombre()));

            return d;
        }).collect(Collectors.toList());
    }
}

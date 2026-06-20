package com.worksync.worksync.controlador;

import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.DTO.ProyectoMiembrosChatDTO;
import com.worksync.worksync.Servicio.mensajeSERVICIO;
import com.worksync.worksync.model.Mensaje;
import com.worksync.worksync.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mensajes")
@CrossOrigin(origins = "*")
public class MensajeController {

    @Autowired
    private mensajeSERVICIO mensajeServicio;

    @Autowired
    private userDAO usuarioDAO;

    // Obtener los contactos agrupados por proyecto
    @GetMapping("/contactos")
    public ResponseEntity<?> obtenerContactos() {
        try {
            String correo = SecurityContextHolder.getContext().getAuthentication().getName();
            List<ProyectoMiembrosChatDTO> contactos = mensajeServicio.obtenerContactosAgrupadosPorProyecto(correo);
            return new ResponseEntity<>(contactos, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Obtener el historial bilateral de mensajes con un contacto
    @GetMapping("/historial/{receptorId}")
    public ResponseEntity<?> obtenerHistorial(@PathVariable Long receptorId) {
        try {
            String correo = SecurityContextHolder.getContext().getAuthentication().getName();
            Usuario logueado = usuarioDAO.findByCorreo(correo)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            List<Mensaje> historial = mensajeServicio.obtenerHistorial(logueado.getId(), receptorId);
            return new ResponseEntity<>(historial, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Enviar un nuevo mensaje
    @PostMapping
    public ResponseEntity<?> enviarMensaje(@RequestBody EnviarMensajeRequest request) {
        try {
            String correo = SecurityContextHolder.getContext().getAuthentication().getName();
            Usuario logueado = usuarioDAO.findByCorreo(correo)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Mensaje mensaje = mensajeServicio.enviarMensaje(
                    logueado.getId(),
                    request.getReceptorId(),
                    request.getProyectoId(),
                    request.getContenido()
            );
            return new ResponseEntity<>(mensaje, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Clase DTO para la petición de enviar mensaje
    public static class EnviarMensajeRequest {
        private Long receptorId;
        private Long proyectoId;
        private String contenido;

        public EnviarMensajeRequest() {}

        public Long getReceptorId() { return receptorId; }
        public void setReceptorId(Long receptorId) { this.receptorId = receptorId; }

        public Long getProyectoId() { return proyectoId; }
        public void setProyectoId(Long proyectoId) { this.proyectoId = proyectoId; }

        public String getContenido() { return contenido; }
        public void setContenido(String contenido) { this.contenido = contenido; }
    }
}

package com.worksync.worksync.controlador;

import com.worksync.worksync.DAO.NotificacionRepository;
import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.Servicio.AlertaProgramadaServicio;
import com.worksync.worksync.model.Notificacion;
import com.worksync.worksync.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// RF-23 Notificaciones & RF-12 Alertas: Consulta y marcación como leídas de las alertas de vencimientos de tareas.
@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*")
public class NotificacionController {

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private AlertaProgramadaServicio alertaProgramadaServicio;

    @Autowired
    private userDAO usuarioDAO;

    // Obtener notificaciones del usuario logueado
    @GetMapping
    public ResponseEntity<?> listarNotificaciones() {
        try {
            String correo = SecurityContextHolder.getContext().getAuthentication().getName();
            Usuario usuario = usuarioDAO.findByCorreo(correo)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

            List<Notificacion> notificaciones = notificacionRepository.findByUsuarioIdOrderByFechaDesc(usuario.getId());
            return new ResponseEntity<>(notificaciones, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Marcar una notificación como leída
    @PutMapping("/{id}/leer")
    public ResponseEntity<?> marcarComoLeida(@PathVariable Long id) {
        try {
            Notificacion notif = notificacionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Notificación no encontrada con id: " + id));

            notif.setLeida(true);
            notificacionRepository.save(notif);
            return new ResponseEntity<>(notif, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // Ejecutar manualmente el escaneo de alertas de plazos (para pruebas rápidas)
    @PostMapping("/ejecutar-alertas")
    public ResponseEntity<?> dispararAlertasManualmente() {
        try {
            int alertas = alertaProgramadaServicio.ejecutarEscaneoManual();
            return new ResponseEntity<>("Escaneo completado. Se generaron " + alertas + " alertas nuevas.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}

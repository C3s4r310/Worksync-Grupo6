package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.NotificacionRepository;
import com.worksync.worksync.DAO.TareaRepository;
import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.model.EstadoTarea;
import com.worksync.worksync.model.Notificacion;
import com.worksync.worksync.model.Tarea;
import com.worksync.worksync.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

// RF-12 Alertas & RF-23 Notificaciones: Escaneo diario automático de tareas próximas a vencer o vencidas, alertas por correo (consola) e internas en base de datos.
@Service
public class AlertaProgramadaServicio {

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private userDAO usuarioDAO;

    // Se ejecuta automáticamente todos los días a las 8 AM
    @Scheduled(cron = "0 0 8 * * ?")
    public void escanearTareasProximasAVencer() {
        ejecutarEscaneoManual();
    }

    // Método manual para poder disparar las alertas en cualquier momento mediante API para pruebas
    public int ejecutarEscaneoManual() {
        List<Tarea> allTasks = tareaRepository.findByEliminadoLogicamenteFalse();
        LocalDate hoy = LocalDate.now();
        LocalDate mañana = hoy.plusDays(1);
        int alertasGeneradas = 0;

        for (Tarea t : allTasks) {
            // Verificar si no está completada y tiene responsable
            if (t.getEstado() != EstadoTarea.COMPLETADA && t.getResponsable() != null && !t.getResponsable().trim().isEmpty()) {
                LocalDate limite = t.getFechaLimite();
                if (limite != null && (limite.equals(hoy) || limite.equals(mañana) || limite.isBefore(hoy))) {
                    Long usuarioId;
                    try {
                        usuarioId = Long.parseLong(t.getResponsable());
                    } catch (NumberFormatException e) {
                        continue;
                    }

                    // Mensaje descriptivo
                    String statusMsg = limite.isBefore(hoy) ? "está retrasada" : "vence pronto";
                    String msg = "La tarea \"" + t.getTitulo() + "\" " + statusMsg + " (" + limite + ").";

                    // Validar duplicidad de notificación para evitar saturar al usuario si el cron se ejecuta repetidamente
                    boolean yaNotificado = notificacionRepository.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
                            .anyMatch(n -> n.getMensaje().equals(msg));

                    if (!yaNotificado) {
                        // 1. Crear la Alerta Visual en base de datos
                        Notificacion notif = new Notificacion();
                        notif.setUsuarioId(usuarioId);
                        notif.setMensaje(msg);
                        notificacionRepository.save(notif);
                        alertasGeneradas++;

                        // 2. Simular el envío de Correo Electrónico por Consola
                        String correoColaborador = usuarioDAO.findById(usuarioId)
                                .map(Usuario::getCorreo)
                                .orElse("colaborador-" + usuarioId + "@worksync.com");
                        
                        System.out.println("[MAIL SERVICE ALERT] 📧 Correo enviado a <" + correoColaborador + 
                                "> sobre tarea \"" + t.getTitulo() + "\". Detalles: " + msg);
                    }
                }
            }
        }

        return alertasGeneradas;
    }
}

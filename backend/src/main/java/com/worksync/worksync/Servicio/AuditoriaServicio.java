package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.AuditoriaRepository;
import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.model.Auditoria;
import com.worksync.worksync.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuditoriaServicio {

    @Autowired
    private AuditoriaRepository auditoriaRepository;

    @Autowired
    private userDAO usuarioDAO;

    // RF-28 Auditoría del Sistema: Registra un evento crítico con usuario y detalles
    public void registrarEvento(String accion, String detalles) {
        String correo = "SYSTEM";
        String nombre = "Sistema Automático";

        if (SecurityContextHolder.getContext().getAuthentication() != null &&
                SecurityContextHolder.getContext().getAuthentication().isAuthenticated() &&
                !"anonymousUser".equals(SecurityContextHolder.getContext().getAuthentication().getName())) {
            correo = SecurityContextHolder.getContext().getAuthentication().getName();
            nombre = usuarioDAO.findByCorreo(correo)
                    .map(Usuario::getNombre)
                    .orElse("Usuario Desconocido");
        }

        Auditoria log = new Auditoria();
        log.setUsuarioCorreo(correo);
        log.setUsuarioNombre(nombre);
        log.setAccion(accion);
        log.setDetalles(detalles);

        auditoriaRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<Auditoria> obtenerTodos() {
        return auditoriaRepository.findByOrderByFechaDesc();
    }
}

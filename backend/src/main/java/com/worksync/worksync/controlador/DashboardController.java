package com.worksync.worksync.controlador;

import com.worksync.worksync.DTO.DashboardDTO;
import com.worksync.worksync.Servicio.dashboardSERVICIO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private dashboardSERVICIO dashboardServicio;

    @GetMapping
    public ResponseEntity<?> obtenerDashboard() {
        try {
            // Obtener el correo del usuario logueado desde el contexto de seguridad
            String correo = SecurityContextHolder.getContext().getAuthentication().getName();
            DashboardDTO dto = dashboardServicio.obtenerDatosDashboard(correo);
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}

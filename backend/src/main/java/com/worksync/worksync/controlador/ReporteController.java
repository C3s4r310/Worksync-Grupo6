package com.worksync.worksync.controlador;

import com.worksync.worksync.DTO.ReporteDashboardDTO;
import com.worksync.worksync.Servicio.reporteSERVICIO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {

    @Autowired
    private reporteSERVICIO reporteServicio;

    @GetMapping
    public ResponseEntity<?> obtenerReporteDashboard() {
        try {
            ReporteDashboardDTO dto = reporteServicio.obtenerReporteDashboard();
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}

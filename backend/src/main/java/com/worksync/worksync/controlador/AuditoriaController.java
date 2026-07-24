package com.worksync.worksync.controlador;

import com.worksync.worksync.Servicio.AuditoriaServicio;
import com.worksync.worksync.model.Auditoria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
@CrossOrigin(origins = "*")
public class AuditoriaController {

    @Autowired
    private AuditoriaServicio auditoriaServicio;

    // RF-28 Auditoría del Sistema: Endpoint para listar la bitácora completa (restringido en SecurityConfig)
    @GetMapping
    public ResponseEntity<List<Auditoria>> listarAuditoria() {
        return new ResponseEntity<>(auditoriaServicio.obtenerTodos(), HttpStatus.OK);
    }
}

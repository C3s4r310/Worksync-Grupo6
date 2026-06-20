package com.worksync.worksync.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worksync.worksync.Servicio.avanceSERVICIO;
import com.worksync.worksync.DTO.avanceDTO;

@RestController
@RequestMapping("/api/avances")
@CrossOrigin(origins = "*")
public class avanceController {

    @Autowired
    private avanceSERVICIO avanceServicio;

    // RF06: Registrar un avance en una tarea
    @PostMapping
    public ResponseEntity<?> registrarAvance(@RequestBody avanceDTO nuevoAvance) {
        return new ResponseEntity<>("Avance registrado", HttpStatus.CREATED);
    }
    
    @GetMapping("/tarea/{tareaId}")
    public ResponseEntity<?> obtenerAvancesDeTarea(@PathVariable Long tareaId) {
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
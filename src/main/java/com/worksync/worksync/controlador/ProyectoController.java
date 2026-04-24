package com.worksync.worksync.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worksync.worksync.Servicio.proyectoSERVICIO; 
import com.worksync.worksync.DTO.proyectoDTO;

import java.util.List;

@RestController
@RequestMapping("/api/proyectos")
@CrossOrigin(origins = "*")
public class ProyectoController {

    @Autowired
    private proyectoSERVICIO proyectoServicio;

    // RF02: Crear un proyecto
    @PostMapping
    public ResponseEntity<?> crearProyecto(@RequestBody proyectoDTO nuevoProyecto) {
        return new ResponseEntity<>("Proyecto creado", HttpStatus.CREATED);
    }

    // RF02: Visualizar proyectos
    @GetMapping
    public ResponseEntity<List<?>> listarProyectos() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // RF02: Editar proyecto
    @PutMapping("/{id}")
    public ResponseEntity<?> editarProyecto(@PathVariable Long id, @RequestBody proyectoDTO proyecto) {
        return new ResponseEntity<>("Proyecto actualizado", HttpStatus.OK);
    }
}
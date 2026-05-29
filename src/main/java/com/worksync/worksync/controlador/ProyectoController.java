package com.worksync.worksync.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worksync.worksync.Servicio.proyectoSERVICIO; 
import com.worksync.worksync.DTO.proyectoDTO;

import java.time.LocalDate;
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

    // RF-24 y RNF-01: Buscar y filtrar proyectos con paginación
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarProyectos(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) String palabraClave,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<proyectoDTO> resultado = proyectoServicio.buscarYFiltrarProyectos(
                    estado, fechaInicio, palabraClave, pageable);
            return new ResponseEntity<>(resultado, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
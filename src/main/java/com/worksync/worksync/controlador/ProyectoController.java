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
        try {
            proyectoDTO creado = proyectoServicio.crearProyecto(nuevoProyecto);
            return new ResponseEntity<>(creado, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF02: Visualizar proyectos
    @GetMapping
    public ResponseEntity<List<?>> listarProyectos() {
        return new ResponseEntity<>(proyectoServicio.listarProyectos(), HttpStatus.OK);
    }

    // RF02: Editar proyecto
    @PutMapping("/{id}")
    public ResponseEntity<?> editarProyecto(@PathVariable Long id, @RequestBody proyectoDTO proyecto) {
        try {
            proyectoDTO actualizado = proyectoServicio.editarProyecto(id, proyecto);
            return new ResponseEntity<>(actualizado, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF-02: Eliminación lógica de proyecto
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProyecto(@PathVariable Long id) {
        try {
            proyectoServicio.eliminarProyecto(id);
            return new ResponseEntity<>("Proyecto eliminado correctamente.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
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
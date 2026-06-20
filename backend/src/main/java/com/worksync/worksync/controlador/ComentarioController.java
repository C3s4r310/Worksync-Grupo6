package com.worksync.worksync.controlador;

import com.worksync.worksync.DTO.comentarioDTO;
import com.worksync.worksync.Servicio.comentarioSERVICIO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tareas/{tareaId}/comentarios")
@CrossOrigin(origins = "*")
public class ComentarioController {

    @Autowired
    private comentarioSERVICIO comentarioServicio;

    @PostMapping
    public ResponseEntity<?> crearComentario(
            @PathVariable Long tareaId,
            @RequestBody comentarioDTO dto) {
        try {
            return new ResponseEntity<>(comentarioServicio.crearComentario(tareaId, dto), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<?> listarComentarios(@PathVariable Long tareaId) {
        try {
            return new ResponseEntity<>(comentarioServicio.listarPorTarea(tareaId), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}

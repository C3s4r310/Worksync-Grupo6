package com.worksync.worksync.controlador;

import com.worksync.worksync.DTO.tareaDTO;
import com.worksync.worksync.Servicio.tareaSERVICIO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "*")
public class tareaControler {

    @Autowired
    private tareaSERVICIO tareaServicio;

    // RF-03: Crear tarea dentro de un proyecto
    @PostMapping
    public ResponseEntity<?> crearTarea(@RequestBody tareaDTO nuevaTarea) {
        try {
            tareaDTO creada = tareaServicio.crear(nuevaTarea);
            return new ResponseEntity<>(creada, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF-03: Obtener tarea por id
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerTarea(@PathVariable Long id) {
        try {
            tareaDTO tarea = tareaServicio.obtenerPorId(id);
            return new ResponseEntity<>(tarea, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // RF-03: Listar tareas de un proyecto
    @GetMapping("/proyecto/{proyectoId}")
    public ResponseEntity<?> listarTareasPorProyecto(@PathVariable Long proyectoId) {
        try {
            List<tareaDTO> tareas = tareaServicio.listarPorProyecto(proyectoId);
            return new ResponseEntity<>(tareas, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF-03: Actualizar datos de una tarea
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarTarea(@PathVariable Long id, @RequestBody tareaDTO dto) {
        try {
            tareaDTO actualizada = tareaServicio.actualizar(id, dto);
            return new ResponseEntity<>(actualizada, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF-03: Eliminación lógica de una tarea
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarTarea(@PathVariable Long id) {
        try {
            tareaServicio.eliminarLogicamente(id);
            return new ResponseEntity<>("Tarea eliminada correctamente.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // RF-05: Cambiar solo el estado de una tarea
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam String nuevoEstado) {
        try {
            tareaDTO actualizada = tareaServicio.actualizarEstado(id, nuevoEstado);
            return new ResponseEntity<>(actualizada, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
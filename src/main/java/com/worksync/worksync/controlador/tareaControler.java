package com.worksync.worksync.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Importando desde tus carpetas actuales
import com.worksync.worksync.Servicio.tareaSERVICIO; // Asumiendo que lo llamarás así
import com.worksync.worksync.DTO.tareaDTO;       // Asumiendo que lo llamarás así

import java.util.List;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "*")
public class tareaControler {

    @Autowired
    private tareaSERVICIO tareaServicio;

    // RF03: Crear tareas dentro de un proyecto
    @PostMapping
    public ResponseEntity<?> crearTarea(@RequestBody tareaDTO nuevaTarea) {
        // Lógica: tareaServicio.guardar(nuevaTarea);
        return new ResponseEntity<>("Tarea creada con éxito", HttpStatus.CREATED);
    }

    // RF05: Cambiar el estado de una tarea (Pendiente, En progreso, etc.)
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam String nuevoEstado) {
        // Lógica: tareaServicio.actualizarEstado(id, nuevoEstado);
        return new ResponseEntity<>("Estado de la tarea actualizado", HttpStatus.OK);
    }
    
    // Obtener todas las tareas de un proyecto
    @GetMapping("/proyecto/{proyectoId}")
    public ResponseEntity<List<?>> listarTareasPorProyecto(@PathVariable Long proyectoId) {
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
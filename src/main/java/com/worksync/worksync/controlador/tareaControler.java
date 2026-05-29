package com.worksync.worksync.controlador;

import com.worksync.worksync.DTO.tareaDTO;
import com.worksync.worksync.Servicio.tareaSERVICIO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "*")
public class tareaControler {

    @Autowired
    private tareaSERVICIO tareaServicio;

    // RF-03: Crear tarea
    @PostMapping
    public ResponseEntity<?> crearTarea(@RequestBody tareaDTO nuevaTarea) {
        try {
            return new ResponseEntity<>(tareaServicio.crear(nuevaTarea), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF-03: Obtener tarea por id
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerTarea(@PathVariable Long id) {
        try {
            return new ResponseEntity<>(tareaServicio.obtenerPorId(id), HttpStatus.OK);
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

    // RF-03: Actualizar tarea
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarTarea(@PathVariable Long id, @RequestBody tareaDTO dto) {
        try {
            return new ResponseEntity<>(tareaServicio.actualizar(id, dto), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF-03: Eliminación lógica
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarTarea(@PathVariable Long id) {
        try {
            tareaServicio.eliminarLogicamente(id);
            return new ResponseEntity<>("Tarea eliminada correctamente.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // RF-05: Cambiar estado
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam String nuevoEstado) {
        try {
            return new ResponseEntity<>(tareaServicio.actualizarEstado(id, nuevoEstado), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF-04: Asignar responsable a una tarea (validando membresía, rol y carga)
    @PutMapping("/{id}/asignar")
    public ResponseEntity<?> asignarResponsable(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        try {
            Long usuarioId = body.get("usuarioId");
            if (usuarioId == null) {
                return new ResponseEntity<>("El campo 'usuarioId' es obligatorio.", HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(tareaServicio.asignarResponsable(id, usuarioId), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF-24: Buscar y filtrar tareas con paginación
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarTareas(
            @RequestParam(required = false) Long proyectoId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String prioridad,
            @RequestParam(required = false) String responsable,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaLimite,
            @RequestParam(required = false) String palabraClave,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<tareaDTO> resultado = tareaServicio.buscarYFiltrarTareas(
                    proyectoId, estado, prioridad, responsable, fechaLimite, palabraClave, pageable);
            return new ResponseEntity<>(resultado, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
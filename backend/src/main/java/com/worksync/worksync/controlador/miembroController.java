package com.worksync.worksync.controlador;

import com.worksync.worksync.DTO.miembroDTO;
import com.worksync.worksync.Servicio.miembroSERVICIO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// RF-09 Miembros del Proyecto: Asignación de usuarios a proyectos.
@RestController
@RequestMapping("/api/proyectos/{proyectoId}/miembros")
@CrossOrigin(origins = "*")
public class miembroController {

    @Autowired
    private miembroSERVICIO miembroServicio;

    // RF-09: Listar miembros activos de un proyecto
    @GetMapping
    public ResponseEntity<?> listarMiembros(@PathVariable Long proyectoId) {
        try {
            List<miembroDTO> miembros = miembroServicio.listarMiembros(proyectoId);
            return new ResponseEntity<>(miembros, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF-09: Agregar miembro a un proyecto (solo ADMIN y LIDER)
    @PostMapping
    public ResponseEntity<?> agregarMiembro(
            @PathVariable Long proyectoId,
            @RequestBody Map<String, Object> body) {
        try {
            Long usuarioId = Long.valueOf(body.get("usuarioId").toString());
            String rol = body.get("rol").toString();

            miembroDTO miembro = miembroServicio.agregarMiembro(proyectoId, usuarioId, rol);
            return new ResponseEntity<>(miembro, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF-09: Retirar miembro de un proyecto (solo ADMIN y LIDER)
    @DeleteMapping("/{usuarioId}")
    public ResponseEntity<?> retirarMiembro(
            @PathVariable Long proyectoId,
            @PathVariable Long usuarioId) {
        try {
            miembroServicio.retirarMiembro(proyectoId, usuarioId);
            return new ResponseEntity<>("Miembro retirado del proyecto.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
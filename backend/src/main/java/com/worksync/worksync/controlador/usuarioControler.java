package com.worksync.worksync.controlador;

import com.worksync.worksync.DTO.userDTO;
import com.worksync.worksync.Servicio.usuarioSERVICIO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// RF-08 Roles y Permisos: Administración de perfiles (Admin, Líder, Colaborador).
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class usuarioControler {

    @Autowired
    private usuarioSERVICIO usuarioServicio;

    // RF-08: Listar todos los usuarios (solo ADMIN — validado en SecurityConfig)
    @GetMapping
    public ResponseEntity<List<userDTO>> listarUsuarios() {
        return new ResponseEntity<>(usuarioServicio.obtenerTodos(), HttpStatus.OK);
    }

    // Obtener usuario por id
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuario(@PathVariable Long id) {
        try {
            return new ResponseEntity<>(usuarioServicio.obtenerPorId(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // RF-08: Cambiar rol de un usuario (solo ADMIN — validado en SecurityConfig)
    @PutMapping("/{id}/rol")
    public ResponseEntity<?> cambiarRol(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String nuevoRol = body.get("rol");
            if (nuevoRol == null) {
                return new ResponseEntity<>("El campo 'rol' es obligatorio.", HttpStatus.BAD_REQUEST);
            }
            userDTO actualizado = usuarioServicio.cambiarRol(id, nuevoRol);
            return new ResponseEntity<>(actualizado, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // RF-01: Cambiar contraseña personal del usuario logueado
    @PutMapping("/cambiar-contrasena")
    public ResponseEntity<?> cambiarContrasena(@RequestBody Map<String, String> body) {
        try {
            String contrasenaActual = body.get("contrasenaActual");
            String nuevaContrasena = body.get("nuevaContrasena");
            if (contrasenaActual == null || nuevaContrasena == null) {
                return new ResponseEntity<>("Ambos campos son obligatorios.", HttpStatus.BAD_REQUEST);
            }
            
            // Obtener el correo del usuario logueado del contexto de seguridad
            String correo = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
            usuarioServicio.cambiarContrasena(correo, contrasenaActual, nuevaContrasena);
            return new ResponseEntity<>("Contraseña actualizada exitosamente.", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
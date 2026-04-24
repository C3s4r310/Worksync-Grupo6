package com.worksync.worksync.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import com.worksync.worksync.Servicio.usuarioSERVICIO;
import com.worksync.worksync.DTO.userDTO;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class usuarioControler {

    @Autowired
    private usuarioSERVICIO usuarioServicio; 

    // Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<?>> listarUsuarios() {
        // Ejemplo: List<userDTO> usuarios = usuarioServicio.obtenerTodos();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // Crear un nuevo usuario
    @PostMapping
    public ResponseEntity<?> guardarUsuario(@RequestBody userDTO nuevoUserDTO) {

        // Lógica para guardar usando usuarioServicio
        return new ResponseEntity<>("Usuario creado", HttpStatus.CREATED);
    }
}
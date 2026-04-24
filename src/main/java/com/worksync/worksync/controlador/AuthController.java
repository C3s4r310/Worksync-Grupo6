package com.worksync.worksync.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worksync.worksync.Servicio.authSERVICIO;
import com.worksync.worksync.DTO.LoginRequestDTO;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private authSERVICIO authServicio;

    // RF01: Inicio de sesión
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO credenciales) {
        // Aquí validarás con JWT y devolverás el token
        return new ResponseEntity<>("Token_JWT_Generado_Aqui", HttpStatus.OK);
    }

    // RF01: Registro de usuario
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Object registroDTO) {
        return new ResponseEntity<>("Usuario registrado correctamente", HttpStatus.CREATED);
    }
}
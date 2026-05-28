package com.worksync.worksync.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worksync.worksync.Servicio.authSERVICIO;
import com.worksync.worksync.DTO.LoginRequestDTO;
import com.worksync.worksync.DTO.RegisterRequestDTO;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private authSERVICIO authServicio;

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequestDTO credenciales
    ) {

        String respuesta = authServicio.login(credenciales);

        return new ResponseEntity<>(respuesta, HttpStatus.OK);
    }

    // REGISTER
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(
            @RequestBody RegisterRequestDTO registroDTO
    ) {

        String respuesta = authServicio.register(registroDTO);

        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }
}
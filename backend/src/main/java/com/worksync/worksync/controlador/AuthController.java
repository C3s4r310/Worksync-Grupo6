package com.worksync.worksync.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.worksync.worksync.Servicio.authSERVICIO;
import com.worksync.worksync.DTO.LoginRequestDTO;
import com.worksync.worksync.DTO.RegisterRequestDTO;

// RF-01 Autenticación y Seguridad: Registro, login y tokens JWT.
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

    // RF-01: Recuperar contraseña
    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<?> recuperarContrasena(@RequestBody java.util.Map<String, String> body) {
        try {
            String correo = body.get("correo");
            String nuevaContrasena = body.get("nuevaContrasena");
            if (correo == null || nuevaContrasena == null) {
                return new ResponseEntity<>("Los campos 'correo' y 'nuevaContrasena' son obligatorios.", HttpStatus.BAD_REQUEST);
            }
            String respuesta = authServicio.recuperarContrasena(correo, nuevaContrasena);
            return new ResponseEntity<>(respuesta, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
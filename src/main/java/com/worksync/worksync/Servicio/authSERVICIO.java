package com.worksync.worksync.Servicio;

import org.springframework.stereotype.Service;
import com.worksync.worksync.DTO.LoginRequestDTO;

@Service
public class authSERVICIO {

    public String login(LoginRequestDTO credenciales) {
        // 1. Buscar usuario por correo en la BD
        // 2. Comparar la contraseña ingresada con la encriptada
        // 3. Si es correcto, generar el Token JWT
        
        if (credenciales.getCorreo().equals("admin@worksync.com") && credenciales.getContrasena().equals("123")) {
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Token Simulado)";
        }
        throw new RuntimeException("Credenciales inválidas");
    }
}
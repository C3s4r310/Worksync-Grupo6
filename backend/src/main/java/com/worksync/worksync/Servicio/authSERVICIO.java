package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.DTO.LoginRequestDTO;
import com.worksync.worksync.DTO.RegisterRequestDTO;
import com.worksync.worksync.JWT.JwtUtil;
import com.worksync.worksync.model.Rol;
import com.worksync.worksync.model.Usuario;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

// RF-01 Autenticación y Seguridad: Registro, login y tokens JWT.
@Service
public class authSERVICIO {

    @Autowired
    private userDAO userDAO;

    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // LOGIN — genera token con correo, rol, ID y nombre
    public String login(LoginRequestDTO credenciales) {
        Usuario usuario = userDAO
                .findByCorreo(credenciales.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(credenciales.getContrasena(), usuario.getContrasena())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return jwtUtil.generarToken(usuario.getCorreo(), usuario.getRol().name(), usuario.getId(), usuario.getNombre());
    }

    // REGISTER — por defecto COLABORADOR si no se especifica
    public String register(RegisterRequestDTO request) {
        if (userDAO.findByCorreo(request.getCorreo()).isPresent()) {
            throw new RuntimeException("Ya existe un usuario con ese correo");
        }

        // RF-01: Validar credenciales seguras (mínimo 8 caracteres, al menos una letra y un número)
        if (request.getContrasena() == null || request.getContrasena().length() < 8 
                || !request.getContrasena().matches(".*[a-zA-Z].*") 
                || !request.getContrasena().matches(".*[0-9].*")) {
            throw new RuntimeException("La contraseña debe tener al menos 8 caracteres y contener letras y números.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));

        Rol rolEnum = Rol.COLABORADOR;
        if (request.getRol() != null && !request.getRol().trim().isEmpty()) {
            try {
                rolEnum = Rol.valueOf(request.getRol().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Rol inválido. Valores válidos: ADMIN, LIDER, COLABORADOR");
            }
        }
        usuario.setRol(rolEnum);

        userDAO.save(usuario);
        return "Usuario registrado correctamente";
    }

    // RF-01: Recuperar contraseña
    public String recuperarContrasena(String correo, String nuevaContrasena) {
        Usuario usuario = userDAO.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("No existe ningún usuario registrado con este correo"));

        // Validar credenciales seguras
        if (nuevaContrasena == null || nuevaContrasena.length() < 8 
                || !nuevaContrasena.matches(".*[a-zA-Z].*") 
                || !nuevaContrasena.matches(".*[0-9].*")) {
            throw new RuntimeException("La nueva contraseña debe tener al menos 8 caracteres y contener letras y números.");
        }

        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        userDAO.save(usuario);
        return "Contraseña recuperada exitosamente.";
    }
}
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

@Service
public class authSERVICIO {

    @Autowired
    private userDAO userDAO;

    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // LOGIN — genera token con correo y rol
    public String login(LoginRequestDTO credenciales) {
        Usuario usuario = userDAO
                .findByCorreo(credenciales.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(credenciales.getContrasena(), usuario.getContrasena())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return jwtUtil.generarToken(usuario.getCorreo(), usuario.getRol().name());
    }

    // REGISTER — por defecto COLABORADOR
    public String register(RegisterRequestDTO request) {
        if (userDAO.findByCorreo(request.getCorreo()).isPresent()) {
            throw new RuntimeException("Ya existe un usuario con ese correo");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setRol(Rol.COLABORADOR);

        userDAO.save(usuario);
        return "Usuario registrado correctamente";
    }
}
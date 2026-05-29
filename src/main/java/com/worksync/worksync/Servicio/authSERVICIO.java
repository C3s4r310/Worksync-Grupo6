package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.DTO.LoginRequestDTO;
import com.worksync.worksync.DTO.RegisterRequestDTO;
import com.worksync.worksync.JWT.JwtUtil;
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

    // LOGIN
    public String login(LoginRequestDTO credenciales) {
        Usuario usuario = userDAO
                .findByCorreo(credenciales.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(credenciales.getContrasena(), usuario.getContrasena())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        // Llamada de instancia, no estática
        return jwtUtil.generarToken(usuario.getCorreo());
    }

    // REGISTER
    public String register(RegisterRequestDTO request) {
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setRol("COLABORADOR");

        userDAO.save(usuario);

        return "Usuario registrado correctamente";
    }
}
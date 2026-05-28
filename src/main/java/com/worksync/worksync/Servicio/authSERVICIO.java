package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.DTO.LoginRequestDTO;
import com.worksync.worksync.DTO.RegisterRequestDTO;
import com.worksync.worksync.model.Usuario;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class authSERVICIO {

    @Autowired
    private userDAO userDAO;

    private BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    // LOGIN
    public String login(LoginRequestDTO credenciales) {

        Usuario usuario = userDAO
                .findByCorreo(credenciales.getCorreo())
                .orElse(null);

        if(usuario == null){
            throw new RuntimeException("Usuario no encontrado");
        }

        // BCrypt
        if(!passwordEncoder.matches(
                credenciales.getContrasena(),
                usuario.getContrasena()
        )){
            throw new RuntimeException("Contraseña incorrecta");
        }

        return JwtUtil.generarToken(usuario.getCorreo());
    }

    // REGISTER
    public String register(RegisterRequestDTO request){

        Usuario usuario = new Usuario();

        usuario.setNombre(request.getNombre());
        usuario.setCorreo(request.getCorreo());

        // BCrypt
        usuario.setContrasena(
                passwordEncoder.encode(
                        request.getContrasena()
                )
        );

        usuario.setRol("COLABORADOR");

        userDAO.save(usuario);

        return "Usuario registrado correctamente";
    }
}
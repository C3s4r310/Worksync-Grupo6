package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.DTO.LoginRequestDTO;
import com.worksync.worksync.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class authSERVICIO {

    @Autowired
    private userDAO userDAO;

    public String login(LoginRequestDTO credenciales) {

        Usuario usuario = userDAO
                .findByCorreo(credenciales.getCorreo())
                .orElse(null);

        if(usuario == null){
            throw new RuntimeException("Usuario no encontrado");
        }

        if(!usuario.getContrasena()
                .equals(credenciales.getContrasena())){

            throw new RuntimeException("Contraseña incorrecta");
        }

        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Token Simulado)";
    }
}

 // REGISTER
    public String register(RegisterRequestDTO request){

        Usuario usuario = new Usuario();

        usuario.setNombre(request.getNombre());
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(request.getContrasena());
        usuario.setRol("COLABORADOR");

        userDAO.save(usuario);

        return "Usuario registrado correctamente";
    }
}
package com.worksync.worksync.Servicio;

import org.springframework.stereotype.Service;
import com.worksync.worksync.DTO.userDTO;
import java.util.ArrayList;
import java.util.List;

@Service
public class usuarioSERVICIO {

    // @Autowired
    // private UsuarioDAO usuarioDao
    // // Lo conectaremos luego a la BD

    // Método para crear usuario con reglas de negocio 
    public userDTO crearUsuario(userDTO nuevoUsuario) {
        // Aquí iría la lógica: Verificar que el correo no exista, encriptar contraseña, etc.
        System.out.println("Lógica de negocio: Validando usuario...");
        return nuevoUsuario; // Retorna el usuario simulando que se guardó
    }

    public List<userDTO> obtenerTodos() {
        // Lógica para pedir datos al DAO y convertirlos a DTO
        return new ArrayList<>();
    }
    
    
}
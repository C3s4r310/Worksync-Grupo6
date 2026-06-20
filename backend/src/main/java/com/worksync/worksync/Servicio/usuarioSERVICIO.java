package com.worksync.worksync.Servicio;

import com.worksync.worksync.DAO.userDAO;
import com.worksync.worksync.DTO.userDTO;
import com.worksync.worksync.model.Rol;
import com.worksync.worksync.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class usuarioSERVICIO {

    @Autowired
    private userDAO usuarioDAO;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Listar todos los usuarios
    public List<userDTO> obtenerTodos() {
        return usuarioDAO.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Obtener usuario por id
    public userDTO obtenerPorId(Long id) {
        Usuario usuario = usuarioDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        return convertirADTO(usuario);
    }

    // RF-08: Cambiar rol — solo ADMIN puede hacer esto (validado en el controlador)
    public userDTO cambiarRol(Long id, String nuevoRol) {
        Usuario usuario = usuarioDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));

        try {
            Rol rol = Rol.valueOf(nuevoRol.toUpperCase());
            usuario.setRol(rol);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rol inválido. Valores válidos: ADMIN, LIDER, COLABORADOR");
        }

        usuarioDAO.save(usuario);
        return convertirADTO(usuario);
    }

    // Obtener el rol de un usuario por correo (usado internamente)
    public Rol obtenerRolPorCorreo(String correo) {
        Usuario usuario = usuarioDAO.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuario.getRol();
    }

    // Conversión entidad → DTO (nunca expone la contraseña)
    private userDTO convertirADTO(Usuario usuario) {
        userDTO dto = new userDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setCorreo(usuario.getCorreo());
        dto.setRol(usuario.getRol() != null ? usuario.getRol().name() : null);
        return dto;
    }

    // RF-01: Cambiar contraseña con validaciones de seguridad
    public void cambiarContrasena(String correo, String contrasenaActual, String nuevaContrasena) {
        Usuario usuario = usuarioDAO.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con correo: " + correo));

        if (!passwordEncoder.matches(contrasenaActual, usuario.getContrasena())) {
            throw new RuntimeException("La contraseña actual es incorrecta.");
        }

        // Validar credenciales seguras
        if (nuevaContrasena == null || nuevaContrasena.length() < 8 
                || !nuevaContrasena.matches(".*[a-zA-Z].*") 
                || !nuevaContrasena.matches(".*[0-9].*")) {
            throw new RuntimeException("La nueva contraseña debe tener al menos 8 caracteres y contener letras y números.");
        }

        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        usuarioDAO.save(usuario);
    }
}
package com.worksync.worksync.DAO;

import com.worksync.worksync.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface userDAO extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

}
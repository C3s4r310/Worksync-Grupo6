package com.worksync.worksync.DAO;

import com.worksync.worksync.model.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {
    // Listar solo proyectos no eliminados
    List<Proyecto> findByEliminadoLogicamenteFalse();
}

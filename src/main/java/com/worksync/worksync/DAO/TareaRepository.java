package com.worksync.worksync.DAO;

import com.worksync.worksync.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface TareaRepository extends JpaRepository<Tarea, Long> {
    // Listar tareas activas de un proyecto
    List<Tarea> findByProyectoIdAndEliminadoLogicamenteFalse(Long proyectoId);

    // Buscar tarea por Id solo si no está eliminada
    Optional<Tarea> findByIdAndEliminadoLogicamenteFalse(Long id);
}

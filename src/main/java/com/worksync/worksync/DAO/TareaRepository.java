package com.worksync.worksync.DAO;

import com.worksync.worksync.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long>, JpaSpecificationExecutor<Tarea> {

    // Listar tareas activas de un proyecto
    List<Tarea> findByProyectoIdAndEliminadoLogicamenteFalse(Long proyectoId);

    // Buscar tarea porid solo si no está eliminada
    Optional<Tarea> findByIdAndEliminadoLogicamenteFalse(Long id);

    // RF-04: Contar tareas activas de un responsable en un proyecto (excluye completadas y canceladas)
    @Query("SELECT COUNT(t) FROM Tarea t WHERE t.responsable = :responsable " +
            "AND t.proyectoId = :proyectoId " +
            "AND t.eliminadoLogicamente = false " +
            "AND t.estado NOT IN ('COMPLETADA', 'CANCELADA')")
    int contarTareasActivasPorResponsable(
            @Param("responsable") String responsable,
            @Param("proyectoId") Long proyectoId);
}
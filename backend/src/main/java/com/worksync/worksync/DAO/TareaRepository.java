package com.worksync.worksync.DAO;

import com.worksync.worksync.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.worksync.worksync.model.EstadoTarea;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long>, JpaSpecificationExecutor<Tarea> {

    // Listar tareas de un proyecto
    List<Tarea> findByProyectoIdAndEliminadoLogicamenteFalse(Long proyectoId);

    // Buscar tarea por id solo si no está eliminada
    Optional<Tarea> findByIdAndEliminadoLogicamenteFalse(Long id);

    // Listar subtareas activas
    List<Tarea> findByTareaPadreIdAndEliminadoLogicamenteFalse(Long tareaPadreId);

    // RF-04: Contar tareas activas de un responsable en un proyecto (excluye completadas y canceladas)
    @Query("SELECT COUNT(t) FROM Tarea t WHERE t.responsable = :responsable " +
            "AND t.proyectoId = :proyectoId " +
            "AND t.eliminadoLogicamente = false " +
            "AND t.estado NOT IN ('COMPLETADA', 'CANCELADA')")
    int contarTareasActivasPorResponsable(
            @Param("responsable") String responsable,
            @Param("proyectoId") Long proyectoId);

    // Contar tareas pendientes asignadas al usuario (estado != COMPLETADA)
    @Query("SELECT COUNT(t) FROM Tarea t WHERE t.responsable = :responsable " +
            "AND t.eliminadoLogicamente = false " +
            "AND t.estado <> com.worksync.worksync.model.EstadoTarea.COMPLETADA")
    long countPendingTasksForUser(@Param("responsable") String responsable);

    // Contar tareas que vencen pronto asignadas al usuario (estado != COMPLETADA y fechaLimite <= limitDate)
    @Query("SELECT COUNT(t) FROM Tarea t WHERE t.responsable = :responsable " +
            "AND t.eliminadoLogicamente = false " +
            "AND t.estado <> com.worksync.worksync.model.EstadoTarea.COMPLETADA " +
            "AND t.fechaLimite IS NOT NULL " +
            "AND t.fechaLimite <= :limitDate")
    long countTasksExpiringSoon(
            @Param("responsable") String responsable,
            @Param("limitDate") LocalDate limitDate);

    // Obtener todas las tareas de un responsable que no están en cierto estado
    List<Tarea> findByResponsableAndEstadoNotAndEliminadoLogicamenteFalse(String responsable, EstadoTarea estado);

    // Obtener todas las tareas del sistema no eliminadas
    List<Tarea> findByEliminadoLogicamenteFalse();
}
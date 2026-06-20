package com.worksync.worksync.DAO;

import com.worksync.worksync.model.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Long>, JpaSpecificationExecutor<Proyecto> {
    
    // Listar solo proyectos no eliminados
    List<Proyecto> findByEliminadoLogicamenteFalse();

    // Contar proyectos activos donde el usuario es el responsable o un miembro activo
    @Query("SELECT COUNT(DISTINCT p) FROM Proyecto p LEFT JOIN MiembroProyecto mp ON p.id = mp.proyectoId " +
           "WHERE p.eliminadoLogicamente = false " +
           "AND UPPER(p.estado) = 'ACTIVO' " +
           "AND (p.responsable = :nombre OR p.responsable = :correo OR (mp.usuarioId = :usuarioId AND mp.activo = true))")
    long countActiveProjectsForUser(
            @Param("nombre") String nombre,
            @Param("correo") String correo,
            @Param("usuarioId") Long usuarioId);

    // Listar proyectos por estado
    List<Proyecto> findByEstadoAndEliminadoLogicamenteFalse(String estado);
}
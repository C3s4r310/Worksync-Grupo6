package com.worksync.worksync.DAO;

import com.worksync.worksync.model.MiembroProyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface MiembroProyectoRepository  extends JpaRepository<MiembroProyecto, Long> {
    // Listar miembros activos de un proyecto
    List<MiembroProyecto> findByProyectoIdAndActivoTrue(Long proyectoId);

    // Listar proyectos donde el usuario es miembro activo
    List<MiembroProyecto> findByUsuarioIdAndActivoTrue(Long usuarioId);

    // Verificar si un usuario es miembro activo de un proyecto
    Optional<MiembroProyecto> findByProyectoIdAndUsuarioIdAndActivoTrue(Long proyectoId, Long usuarioId);

    // Verificar si ya existe la relación (activa o no) para evitar duplicados
    Optional<MiembroProyecto> findByProyectoIdAndUsuarioId(Long proyectoId, Long usuarioId);
}


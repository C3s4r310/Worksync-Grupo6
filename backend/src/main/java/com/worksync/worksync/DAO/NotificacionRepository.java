package com.worksync.worksync.DAO;

import com.worksync.worksync.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    
    // Buscar todas las notificaciones de un usuario ordenadas por fecha reciente
    List<Notificacion> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    // Contar notificaciones no leídas de un usuario
    long countByUsuarioIdAndLeidaFalse(Long usuarioId);
}

package com.worksync.worksync.DAO;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.worksync.worksync.model.Comentario;
import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    
    // Consulta automatizada para traer la conversación en orden
    List<Comentario> findByTareaIdOrderByFechaCreacionAsc(Long tareaId);
    
}
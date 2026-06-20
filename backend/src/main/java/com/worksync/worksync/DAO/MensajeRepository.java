package com.worksync.worksync.DAO;

import com.worksync.worksync.model.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    @Query("SELECT m FROM Mensaje m WHERE (m.emisorId = :u1 AND m.receptorId = :u2) " +
           "OR (m.emisorId = :u2 AND m.receptorId = :u1) " +
           "ORDER BY m.fechaEnvio ASC")
    List<Mensaje> findChatHistory(@Param("u1") Long u1, @Param("u2") Long u2);
}

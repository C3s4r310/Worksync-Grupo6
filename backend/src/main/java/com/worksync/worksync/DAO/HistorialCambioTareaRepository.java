package com.worksync.worksync.DAO;

import com.worksync.worksync.model.HistorialCambioTarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistorialCambioTareaRepository extends JpaRepository<HistorialCambioTarea, Long> {
    
    // Consultar el historial de una tarea ordenada cronológicamente
    List<HistorialCambioTarea> findByTareaIdOrderByFechaDesc(Long tareaId);

    // Obtener las últimas 15 acciones de cambio de estado en todo el sistema
    List<HistorialCambioTarea> findTop15ByOrderByFechaDesc();

    // Obtener todas las transiciones a un estado específico
    List<HistorialCambioTarea> findByEstadoNuevo(String estadoNuevo);
}

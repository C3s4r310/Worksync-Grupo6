package com.worksync.worksync.Servicio;

import org.springframework.stereotype.Service;
import com.worksync.worksync.DTO.tareaDTO;

@Service
public class tareaSERVICIO {

    // Método principal para el RF03 
    public tareaDTO crear(tareaDTO tareaDTO) {
        // Lógica: Asignar estado inicial "Pendiente", verificar que el proyecto exista
        tareaDTO.setEstado("Pendiente"); 
        return tareaDTO;
    }

    // Método principal para el RF05 
    public tareaDTO actualizarEstado(Long tareaId, String nuevoEstado) {
        // Lógica clave de negocio: Verificar dependencias antes de cambiar de estado [cite: 336]
        // Si la tarea tiene un prerrequisito no completado, lanzar excepción.
        
        System.out.println("Cambiando tarea " + tareaId + " a estado: " + nuevoEstado);
        tareaDTO tareaSimulada = new tareaDTO();
        tareaSimulada.setEstado(nuevoEstado);
        return tareaSimulada;
    }
}
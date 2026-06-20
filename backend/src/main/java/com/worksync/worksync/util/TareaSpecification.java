package com.worksync.worksync.util;

import com.worksync.worksync.model.Prioridad;
import com.worksync.worksync.model.Tarea;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TareaSpecification {

    public static Specification<Tarea> filtrarTareas(
            Long proyectoId, 
            String estado, 
            String prioridad, 
            String responsable, 
            LocalDate fechaLimite, 
            String palabraClave) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicados = new ArrayList<>();

            // 1. SIEMPRE filtrar las que NO están eliminadas lógicamente
            predicados.add(criteriaBuilder.isFalse(root.get("eliminadoLogicamente")));

            // 2. Filtro por Proyecto (Opcional)
            if (proyectoId != null) {
                predicados.add(criteriaBuilder.equal(root.get("proyectoId"), proyectoId));
            }

            // 3. Filtro por Estado
            if (estado != null && !estado.trim().isEmpty()) {
                predicados.add(criteriaBuilder.equal(root.get("estado"), estado));
            }

            // 4. Filtro por Prioridad (Convierte el String del front al Enum de tu backend)
            if (prioridad != null && !prioridad.trim().isEmpty()) {
                try {
                    Prioridad enumPrioridad = Prioridad.valueOf(prioridad.toUpperCase());
                    predicados.add(criteriaBuilder.equal(root.get("prioridad"), enumPrioridad));
                } catch (IllegalArgumentException e) {
                    // Si el frontend manda una prioridad inválida, simplemente ignoramos este filtro
                }
            }

            // 5. Filtro por Responsable
            if (responsable != null && !responsable.trim().isEmpty()) {
                predicados.add(criteriaBuilder.equal(root.get("responsable"), responsable));
            }

            // 6. Filtro por Fecha Límite (Tareas que vencen en o antes de la fecha enviada)
            if (fechaLimite != null) {
                predicados.add(criteriaBuilder.lessThanOrEqualTo(root.get("fechaLimite"), fechaLimite));
            }

            // 7. Filtro por Palabra Clave (Busca coincidencias en Título o Descripción)
            if (palabraClave != null && !palabraClave.trim().isEmpty()) {
                String patron = "%" + palabraClave.toLowerCase() + "%";
                Predicate tituloMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("titulo")), patron);
                Predicate descMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("descripcion")), patron);
                predicados.add(criteriaBuilder.or(tituloMatch, descMatch));
            }

            // Une todos los filtros acumulados usando un "AND"
            return criteriaBuilder.and(predicados.toArray(new Predicate[0]));
        };
    }
}
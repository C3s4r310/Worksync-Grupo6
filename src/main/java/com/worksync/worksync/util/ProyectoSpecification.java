package com.worksync.worksync.util;

import com.worksync.worksync.model.Proyecto;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ProyectoSpecification {

    public static Specification<Proyecto> filtrarProyectos(
            String estado, 
            LocalDate fechaInicio, 
            String palabraClave) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicados = new ArrayList<>();

            // 1. SIEMPRE filtrar los que NO están eliminados lógicamente
            predicados.add(criteriaBuilder.isFalse(root.get("eliminadoLogicamente")));

            // 2. Filtro por Estado
            if (estado != null && !estado.trim().isEmpty()) {
                predicados.add(criteriaBuilder.equal(root.get("estado"), estado));
            }

            // 3. Filtro por Fecha de Inicio (Proyectos que inician en o después de la fecha)
            if (fechaInicio != null) {
                predicados.add(criteriaBuilder.greaterThanOrEqualTo(root.get("fechaInicio"), fechaInicio));
            }

            // 4. Filtro por Palabra Clave (Busca en Nombre o Descripción)
            if (palabraClave != null && !palabraClave.trim().isEmpty()) {
                String patron = "%" + palabraClave.toLowerCase() + "%";
                Predicate nombreMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("nombre")), patron);
                Predicate descMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("descripcion")), patron);
                predicados.add(criteriaBuilder.or(nombreMatch, descMatch));
            }

            return criteriaBuilder.and(predicados.toArray(new Predicate[0]));
        };
    }
}
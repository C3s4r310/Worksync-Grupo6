package com.worksync.worksync.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RolConverter implements AttributeConverter<Rol, String> {

    @Override
    public String convertToDatabaseColumn(Rol attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public Rol convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return Rol.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Default fallback if database value is corrupted or unrecognized
            return Rol.COLABORADOR;
        }
    }
}

package com.worksync.worksync.DTO;

public class LoginRequestDTO {
    
    private String correo;
    private String contrasena;

    // Constructor vacío (obligatorio para Spring/JSON)
    public LoginRequestDTO() {
    }

    // Constructor con parámetros (opcional, pero útil)
    public LoginRequestDTO(String correo, String contrasena) {
        this.correo = correo;
        this.contrasena = contrasena;
    }

    // --- GETTERS (Estos son los que te faltan) ---
    public String getCorreo() {
        return correo;
    }

    public String getContrasena() {
        return contrasena;
    }

    // --- SETTERS ---
    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
}
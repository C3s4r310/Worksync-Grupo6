package com.worksync.worksync.JWT;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final long EXPIRACION_MS = 1000 * 60 * 60 * 24;

    // Genera un token JWT — ahora es de instancia, no estático
    public String generarToken(String correo) {
        return Jwts.builder()
                .setSubject(correo)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRACION_MS))
                .signWith(SECRET_KEY)
                .compact();
    }

    // Extrae el correo (subject) del token
    public String extraerCorreo(String token) {
        return extraerClaims(token).getSubject();
    }

    // Valid que el token no haya expirado
    public boolean tokenEsValido(String token) {
        try {
            Date expiracion = extraerClaims(token).getExpiration();
            return expiracion.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // Extrae todos los claims del token
    private Claims extraerClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
package com.worksync.worksync.JWT;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Key SECRET_KEY;
    private static final long EXPIRACION_MS = 1000 * 60 * 60 * 24; // 24 horas

    @PostConstruct
    public void init() {
        String secret = jwtSecret;
        if (secret == null || secret.isEmpty() || secret.startsWith("${")) {
            secret = "a-very-secure-and-long-fixed-secret-key-of-at-least-256-bits-for-worksync-jwt-tokens";
        }
        byte[] keyBytes = secret.getBytes();
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, Math.min(keyBytes.length, 32));
            keyBytes = padded;
        }
        this.SECRET_KEY = Keys.hmacShaKeyFor(keyBytes);
    }

    // Genera token con correo, rol, ID y nombre incluidos
    public String generarToken(String correo, String rol, Long id, String nombre) {
        return Jwts.builder()
                .setSubject(correo)
                .claim("rol", rol)
                .claim("id", id)
                .claim("nombre", nombre)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRACION_MS))
                .signWith(SECRET_KEY)
                .compact();
    }

    // Extrae el correo del token
    public String extraerCorreo(String token) {
        return extraerClaims(token).getSubject();
    }

    // Extrae el rol del token
    public String extraerRol(String token) {
        return extraerClaims(token).get("rol", String.class);
    }

    // Valida que el token no haya expirado
    public boolean tokenEsValido(String token) {
        try {
            return extraerClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extraerClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
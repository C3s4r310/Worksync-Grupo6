package com.worksync.worksync.Config;

import com.worksync.worksync.JWT.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // Rutas públicas
                        .requestMatchers("/api/auth/**").permitAll()

                        // RF-08: Solo ADMIN puede cambiar roles
                        .requestMatchers(HttpMethod.PUT, "/api/usuarios/*/rol").hasRole("ADMIN")

                        // RF-08: Solo ADMIN puede listar todos los usuarios
                        .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")

                        // RF-02: Solo ADMIN y LIDER pueden crear y editar proyectos
                        .requestMatchers(HttpMethod.POST, "/api/proyectos").hasAnyRole("ADMIN", "LIDER")
                        .requestMatchers(HttpMethod.PUT, "/api/proyectos/**").hasAnyRole("ADMIN", "LIDER")

                        // RF-09: Solo ADMIN y LIDER pueden agregar y retirar miembros
                        .requestMatchers(HttpMethod.POST, "/api/proyectos/*/miembros").hasAnyRole("ADMIN", "LIDER")
                        .requestMatchers(HttpMethod.DELETE, "/api/proyectos/*/miembros/*").hasAnyRole("ADMIN", "LIDER")

                        // RF-03: Solo ADMIN y LIDER pueden crear, editar y eliminar tareas
                        .requestMatchers(HttpMethod.POST, "/api/tareas").hasAnyRole("ADMIN", "LIDER")
                        .requestMatchers(HttpMethod.PUT, "/api/tareas/**").hasAnyRole("ADMIN", "LIDER")
                        .requestMatchers(HttpMethod.DELETE, "/api/tareas/**").hasAnyRole("ADMIN", "LIDER")

                        // Cualquier usuario autenticado puede ver tareas y proyectos
                        .requestMatchers(HttpMethod.GET, "/api/tareas/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/proyectos/**").authenticated()

                        // Todo lo demás requiere autenticación
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
package com.worksync.worksync.Config;

import com.worksync.worksync.DAO.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ApplicationConfig {

    @Autowired
    private userDAO userDao;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userDao.findByCorreo(username)
                .map(usuario -> org.springframework.security.core.userdetails.User.builder()
                        .username(usuario.getCorreo())
                        .password(usuario.getContrasena())
                        .roles(usuario.getRol().name().toUpperCase())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + username));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

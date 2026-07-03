package com.worksync.worksync;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.worksync.worksync.JWT.JwtUtil;

@SpringBootTest
class WorksyncApplicationTests {

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    void contextLoads() {
        String token = jwtUtil.generarToken("testuser@gmail.com", "COLABORADOR", 11L, "Test User");
        System.out.println("TEST_JWT_TOKEN: " + token);
    }
}



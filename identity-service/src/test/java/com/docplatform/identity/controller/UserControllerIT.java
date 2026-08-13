package com.docplatform.identity.controller;

import com.docplatform.identity.config.SecurityConfig;
import com.docplatform.identity.security.JwtAuthenticationFilter;
import com.docplatform.identity.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
class UserControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.docplatform.identity.service.interfaces.UserService userService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private com.docplatform.identity.repository.UserRepository userRepository;

    @Test
    void contextLoads() {
        assertNotNull(mockMvc);
    }
}

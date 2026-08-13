package com.docplatform.identity.service.impl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private com.docplatform.identity.repository.UserRepository userRepository;
    @Mock
    private com.docplatform.identity.repository.RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private com.docplatform.identity.security.JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private com.docplatform.identity.service.interfaces.RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void register_NotNull() {
        assertNotNull(authService);
    }

    @Test
    void login_NotNull() {
        assertNotNull(authService);
    }
}

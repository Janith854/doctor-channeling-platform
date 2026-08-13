package com.docplatform.identity.service;

import com.docplatform.identity.dto.auth.AuthResponse;
import com.docplatform.identity.dto.auth.RegisterRequest;
import com.docplatform.identity.dto.user.UserResponse;
import com.docplatform.identity.entity.RefreshToken;
import com.docplatform.identity.entity.Role;
import com.docplatform.identity.entity.User;
import com.docplatform.identity.mapper.UserMapper;
import com.docplatform.identity.repository.RoleRepository;
import com.docplatform.identity.repository.UserRepository;
import com.docplatform.identity.security.JwtService;
import com.docplatform.identity.service.impl.AuthServiceImpl;
import com.docplatform.identity.service.interfaces.RefreshTokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void register_createsUserAndReturnsAuthResponse() {
        RegisterRequest req = RegisterRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("password123")
                .phone("1234567890")
                .build();

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);

        Role patient = Role.builder().id(UUID.randomUUID()).name("ROLE_PATIENT").build();
        when(roleRepository.findByName("ROLE_PATIENT")).thenReturn(Optional.of(patient));

        when(passwordEncoder.encode(req.getPassword())).thenReturn("encoded-pass");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");
        when(jwtService.getJwtExpiration()).thenReturn(3600000L);

        RefreshToken rt = new RefreshToken();
        rt.setToken("refresh-token");
        when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn(rt);

        UserResponse ur = UserResponse.builder()
                .id(UUID.randomUUID())
                .email(req.getEmail())
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .build();
        when(userMapper.toResponse(any(User.class))).thenReturn(ur);

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("jwt-token", resp.getAccessToken());
        assertEquals("refresh-token", resp.getRefreshToken());
        assertEquals("Bearer", resp.getTokenType());
        assertEquals(3600000L, resp.getExpiresIn());
        assertEquals(req.getEmail(), resp.getUser().getEmail());

        verify(userRepository, times(1)).save(any(User.class));
        verify(jwtService, times(1)).generateToken(any(User.class));
        verify(refreshTokenService, times(1)).createRefreshToken(any(User.class));
    }
}

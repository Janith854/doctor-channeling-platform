package com.docplatform.identity.service.impl;

import com.docplatform.identity.dto.auth.AuthResponse;
import com.docplatform.identity.dto.auth.LoginRequest;
import com.docplatform.identity.dto.auth.RefreshTokenRequest;
import com.docplatform.identity.dto.auth.RegisterRequest;
import com.docplatform.identity.entity.RefreshToken;
import com.docplatform.identity.entity.Role;
import com.docplatform.identity.entity.User;
import com.docplatform.identity.exception.DuplicateEmailException;
import com.docplatform.identity.exception.ResourceNotFoundException;
import com.docplatform.identity.mapper.UserMapper;
import com.docplatform.identity.repository.RoleRepository;
import com.docplatform.identity.repository.UserRepository;
import com.docplatform.identity.security.JwtService;
import com.docplatform.identity.service.interfaces.AuthService;
import com.docplatform.identity.service.interfaces.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
        private final UserMapper userMapper;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already in use");
        }

        Role patientRole = roleRepository.findByName("ROLE_PATIENT")
                .orElseThrow(() -> new ResourceNotFoundException("Default role ROLE_PATIENT not found"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(patientRole)
                .build();

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
            .expiresIn(jwtService.getJwtExpiration())
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Authenticating user: {}", request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String jwtToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
            .expiresIn(jwtService.getJwtExpiration())
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        log.info("Processing refresh token request");

        RefreshToken refreshToken = refreshTokenService.findByToken(requestRefreshToken);
        refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken(requestRefreshToken)
                .tokenType("Bearer")
            .expiresIn(jwtService.getJwtExpiration())
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    public void logout(String refreshToken) {
        log.info("Logging out user, deleting refresh token");
        refreshTokenService.deleteByToken(refreshToken);
    }
}

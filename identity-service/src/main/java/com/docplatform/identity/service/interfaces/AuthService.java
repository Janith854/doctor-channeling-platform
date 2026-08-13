package com.docplatform.identity.service.interfaces;

import com.docplatform.identity.dto.auth.AuthResponse;
import com.docplatform.identity.dto.auth.LoginRequest;
import com.docplatform.identity.dto.auth.RefreshTokenRequest;
import com.docplatform.identity.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String refreshToken);
}

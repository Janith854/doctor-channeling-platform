package com.docplatform.identity.service.impl;

import com.docplatform.identity.entity.RefreshToken;
import com.docplatform.identity.entity.User;
import com.docplatform.identity.exception.InvalidTokenException;
import com.docplatform.identity.repository.RefreshTokenRepository;
import com.docplatform.identity.service.interfaces.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-token.expiration:604800000}")
    private long refreshTokenExpirationMs = 604800000L;

    @Override
    public RefreshToken createRefreshToken(User user) {
        Instant expiryInstant = Instant.now().plusMillis(refreshTokenExpirationMs);
        RefreshToken refreshToken = RefreshToken.builder()
            .user(user)
            .token(UUID.randomUUID().toString())
            .expiryDate(LocalDateTime.ofInstant(expiryInstant, ZoneId.systemDefault()))
            .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new InvalidTokenException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    @Override
    public void deleteByToken(String token) {
        RefreshToken refreshToken = findByToken(token);
        refreshTokenRepository.delete(refreshToken);
    }

    @Override
    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));
    }
}

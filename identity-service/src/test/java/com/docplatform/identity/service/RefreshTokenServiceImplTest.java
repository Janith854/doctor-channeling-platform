package com.docplatform.identity.service;

import com.docplatform.identity.entity.RefreshToken;
import com.docplatform.identity.entity.User;
import com.docplatform.identity.exception.InvalidTokenException;
import com.docplatform.identity.repository.RefreshTokenRepository;
import com.docplatform.identity.service.impl.RefreshTokenServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceImplTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenServiceImpl refreshTokenService;

    @Test
    void createRefreshToken_savesToken() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@example.com");

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RefreshToken rt = refreshTokenService.createRefreshToken(user);

        assertNotNull(rt);
        assertNotNull(rt.getToken());
        assertFalse(rt.getToken().isEmpty());
        assertEquals(user, rt.getUser());
        assertNotNull(rt.getExpiryDate());
        assertTrue(rt.getExpiryDate().isAfter(LocalDateTime.now()));
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    void verifyExpiration_validToken_returnsToken() {
        RefreshToken validToken = new RefreshToken();
        validToken.setExpiryDate(LocalDateTime.now().plusDays(1));

        RefreshToken result = refreshTokenService.verifyExpiration(validToken);

        assertNotNull(result);
        assertEquals(validToken, result);
        verify(refreshTokenRepository, never()).delete(any());
    }

    @Test
    void verifyExpiration_throwsWhenExpired() {
        RefreshToken expired = new RefreshToken();
        expired.setExpiryDate(LocalDateTime.now().minusDays(1));

        doNothing().when(refreshTokenRepository).delete(expired);

        assertThrows(InvalidTokenException.class, () -> refreshTokenService.verifyExpiration(expired));
        verify(refreshTokenRepository, times(1)).delete(expired);
    }

    @Test
    void deleteByToken_tokenExists_deletesToken() {
        RefreshToken rt = new RefreshToken();
        rt.setToken("valid-token");
        when(refreshTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(rt));
        doNothing().when(refreshTokenRepository).delete(rt);

        refreshTokenService.deleteByToken("valid-token");

        verify(refreshTokenRepository, times(1)).findByToken("valid-token");
        verify(refreshTokenRepository, times(1)).delete(rt);
    }

    @Test
    void deleteByToken_tokenNotFound_throwsException() {
        when(refreshTokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        assertThrows(InvalidTokenException.class, () -> refreshTokenService.deleteByToken("invalid-token"));
        verify(refreshTokenRepository, times(1)).findByToken("invalid-token");
        verify(refreshTokenRepository, never()).delete(any());
    }

    @Test
    void findByToken_returnsToken() {
        RefreshToken rt = new RefreshToken();
        rt.setToken("t");
        when(refreshTokenRepository.findByToken("t")).thenReturn(Optional.of(rt));

        RefreshToken found = refreshTokenService.findByToken("t");
        assertEquals("t", found.getToken());
    }

    @Test
    void findByToken_notFound_throwsException() {
        when(refreshTokenRepository.findByToken("unknown")).thenReturn(Optional.empty());

        assertThrows(InvalidTokenException.class, () -> refreshTokenService.findByToken("unknown"));
    }
}

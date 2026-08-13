package com.docplatform.identity.service.interfaces;

import com.docplatform.identity.entity.RefreshToken;
import com.docplatform.identity.entity.User;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(User user);
    RefreshToken verifyExpiration(RefreshToken token);
    void deleteByToken(String token);
    RefreshToken findByToken(String token);
}

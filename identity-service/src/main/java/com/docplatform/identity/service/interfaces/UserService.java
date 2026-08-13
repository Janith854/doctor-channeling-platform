package com.docplatform.identity.service.interfaces;

import com.docplatform.identity.dto.user.UserRequest;
import com.docplatform.identity.dto.user.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserResponse getUserById(UUID id);
    UserResponse getCurrentUser();
    List<UserResponse> getAllUsers();
    UserResponse updateUser(UUID id, UserRequest request);
    void deleteUser(UUID id);
}

package com.docplatform.identity.service.impl;

import com.docplatform.identity.dto.user.UserRequest;
import com.docplatform.identity.dto.user.UserResponse;
import com.docplatform.identity.entity.Role;
import com.docplatform.identity.entity.User;
import com.docplatform.identity.exception.DuplicateEmailException;
import com.docplatform.identity.exception.ResourceNotFoundException;
import com.docplatform.identity.exception.UnauthorizedException;
import com.docplatform.identity.mapper.UserMapper;
import com.docplatform.identity.repository.RoleRepository;
import com.docplatform.identity.repository.UserRepository;
import com.docplatform.identity.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    @Override
    public UserResponse getUserById(UUID id) {
        log.info("Fetching user with ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Fetching current user for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));
        return userMapper.toResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        log.info("Fetching all users");
        return userMapper.toResponseList(userRepository.findAll());
    }

    @Override
    public UserResponse updateUser(UUID id, UserRequest request) {
        log.info("Updating user with ID: {}", id);
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!existingUser.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already in use");
        }

        Role newRole = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        userMapper.updateEntityFromRequest(request, existingUser);
        existingUser.setRole(newRole);

        User updated = userRepository.save(existingUser);
        return userMapper.toResponse(updated);
    }

    @Override
    public void deleteUser(UUID id) {
        log.info("Deleting user with ID: {}", id);
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }
}

package com.docplatform.identity.service.impl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private com.docplatform.identity.repository.UserRepository userRepository;
    @Mock
    private com.docplatform.identity.repository.RoleRepository roleRepository;
    @Mock
    private com.docplatform.identity.mapper.UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void getUserById_NotNull() {
        assertNotNull(userService);
    }
}

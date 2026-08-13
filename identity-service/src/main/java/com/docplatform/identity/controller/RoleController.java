package com.docplatform.identity.controller;

import com.docplatform.identity.dto.user.RoleRequest;
import com.docplatform.identity.dto.user.RoleResponse;
import com.docplatform.identity.entity.Role;
import com.docplatform.identity.mapper.RoleMapper;
import com.docplatform.identity.payload.ApiResponse;
import com.docplatform.identity.repository.RoleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Tag(name = "Role API", description = "Endpoints for role management")
public class RoleController {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @GetMapping
    @Operation(summary = "Get all roles (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        List<RoleResponse> roles = roleMapper.toResponseList(roleRepository.findAll());
        return ResponseEntity.ok(ApiResponse.<List<RoleResponse>>builder()
                .success(true)
                .message("Roles retrieved successfully")
                .data(roles)
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(@PathVariable UUID id) {
        Role role = roleRepository.findById(id).orElseThrow(() -> new RuntimeException("Role not found"));
        return ResponseEntity.ok(ApiResponse.<RoleResponse>builder()
                .success(true)
                .message("Role retrieved successfully")
                .data(roleMapper.toResponse(role))
                .build());
    }

    @PostMapping
    @Operation(summary = "Create a new role (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@Valid @RequestBody RoleRequest request) {
        Role role = roleMapper.toEntity(RoleResponse.builder().name(request.getName()).description(request.getDescription()).build());
        Role saved = roleRepository.save(role);
        return ResponseEntity.ok(ApiResponse.<RoleResponse>builder()
                .success(true)
                .message("Role created successfully")
                .data(roleMapper.toResponse(saved))
                .build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update role (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(@PathVariable UUID id, @Valid @RequestBody RoleRequest request) {
        Role existing = roleRepository.findById(id).orElseThrow(() -> new RuntimeException("Role not found"));
        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        Role updated = roleRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.<RoleResponse>builder()
                .success(true)
                .message("Role updated successfully")
                .data(roleMapper.toResponse(updated))
                .build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete role (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable UUID id) {
        roleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Role deleted successfully")
                .build());
    }
}

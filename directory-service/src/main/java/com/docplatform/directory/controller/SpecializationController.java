package com.docplatform.directory.controller;

import com.docplatform.directory.dto.mapper.SpecializationMapper;
import com.docplatform.directory.dto.request.SpecializationRequest;
import com.docplatform.directory.dto.response.SpecializationResponse;
import com.docplatform.directory.entity.Specialization;
import com.docplatform.directory.payload.ApiResponse;
import com.docplatform.directory.service.SpecializationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/specializations")
@RequiredArgsConstructor
@Validated
@Tag(name = "Specialization API", description = "Endpoints for managing specializations")
public class SpecializationController {

    private final SpecializationService specializationService;
    private final SpecializationMapper specializationMapper;

    @PostMapping
    @Operation(summary = "Create a new specialization")
    public ResponseEntity<ApiResponse<SpecializationResponse>> createSpecialization(@Valid @RequestBody SpecializationRequest request) {
        Specialization entity = specializationMapper.toEntity(request);
        Specialization savedEntity = specializationService.createSpecialization(entity);
        
        ApiResponse<SpecializationResponse> response = ApiResponse.<SpecializationResponse>builder()
                .success(true)
                .message("Specialization created successfully")
                .data(specializationMapper.toResponse(savedEntity))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all specializations")
    public ResponseEntity<ApiResponse<List<SpecializationResponse>>> getAllSpecializations() {
        List<Specialization> specializations = specializationService.getAllSpecializations();
        
        ApiResponse<List<SpecializationResponse>> response = ApiResponse.<List<SpecializationResponse>>builder()
                .success(true)
                .message("Specializations retrieved successfully")
                .data(specializationMapper.toResponseList(specializations))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specialization by ID")
    public ResponseEntity<ApiResponse<SpecializationResponse>> getSpecializationById(@PathVariable UUID id) {
        return specializationService.getSpecializationById(id)
                .map(specializationMapper::toResponse)
                .map(dto -> ApiResponse.<SpecializationResponse>builder()
                        .success(true)
                        .message("Specialization retrieved successfully")
                        .data(dto)
                        .timestamp(LocalDateTime.now())
                        .build())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        ApiResponse.<SpecializationResponse>builder()
                                .success(false)
                                .message("Specialization not found")
                                .timestamp(LocalDateTime.now())
                                .build()
                ));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a specialization")
    public ResponseEntity<ApiResponse<SpecializationResponse>> updateSpecialization(
            @PathVariable UUID id,
            @Valid @RequestBody SpecializationRequest request) {
        Specialization entityToUpdate = specializationMapper.toEntity(request);
        Specialization updatedEntity = specializationService.updateSpecialization(id, entityToUpdate);
        
        ApiResponse<SpecializationResponse> response = ApiResponse.<SpecializationResponse>builder()
                .success(true)
                .message("Specialization updated successfully")
                .data(specializationMapper.toResponse(updatedEntity))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a specialization by ID")
    public ResponseEntity<ApiResponse<Void>> deleteSpecialization(@PathVariable UUID id) {
        specializationService.deleteSpecialization(id);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Specialization deleted successfully")
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response);
    }
}

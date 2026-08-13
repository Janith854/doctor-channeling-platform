package com.docplatform.directory.controller;

import com.docplatform.directory.dto.mapper.DoctorMapper;
import com.docplatform.directory.dto.request.DoctorRequest;
import com.docplatform.directory.dto.response.DoctorResponse;
import com.docplatform.directory.entity.Doctor;
import com.docplatform.directory.payload.ApiResponse;
import com.docplatform.directory.service.DoctorService;
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
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@Validated
@Tag(name = "Doctor API", description = "Endpoints for managing doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorMapper doctorMapper;

    @PostMapping
    @Operation(summary = "Create a new doctor")
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(@Valid @RequestBody DoctorRequest request) {
        Doctor entity = doctorMapper.toEntity(request);
        Doctor savedEntity = doctorService.createDoctor(entity);
        
        ApiResponse<DoctorResponse> response = ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor created successfully")
                .data(doctorMapper.toResponse(savedEntity))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        
        ApiResponse<List<DoctorResponse>> response = ApiResponse.<List<DoctorResponse>>builder()
                .success(true)
                .message("Doctors retrieved successfully")
                .data(doctorMapper.toResponseList(doctors))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a doctor by ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable UUID id) {
        return doctorService.getDoctorById(id)
                .map(doctorMapper::toResponse)
                .map(dto -> ApiResponse.<DoctorResponse>builder()
                        .success(true)
                        .message("Doctor retrieved successfully")
                        .data(dto)
                        .timestamp(LocalDateTime.now())
                        .build())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        ApiResponse.<DoctorResponse>builder()
                                .success(false)
                                .message("Doctor not found")
                                .timestamp(LocalDateTime.now())
                                .build()
                ));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a doctor")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable UUID id,
            @Valid @RequestBody DoctorRequest request) {
        Doctor entityToUpdate = doctorMapper.toEntity(request);
        Doctor updatedEntity = doctorService.updateDoctor(id, entityToUpdate);
        
        ApiResponse<DoctorResponse> response = ApiResponse.<DoctorResponse>builder()
                .success(true)
                .message("Doctor updated successfully")
                .data(doctorMapper.toResponse(updatedEntity))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a doctor by ID")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable UUID id) {
        doctorService.deleteDoctor(id);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Doctor deleted successfully")
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response); // Standardly we could return 204 No Content, but since we are wrapping in ApiResponse, 200 OK with success=true is cleaner.
    }
}

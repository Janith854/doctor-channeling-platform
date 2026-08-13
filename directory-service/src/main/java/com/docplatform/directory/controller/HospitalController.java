package com.docplatform.directory.controller;

import com.docplatform.directory.dto.mapper.HospitalMapper;
import com.docplatform.directory.dto.request.HospitalRequest;
import com.docplatform.directory.dto.response.HospitalResponse;
import com.docplatform.directory.entity.Hospital;
import com.docplatform.directory.payload.ApiResponse;
import com.docplatform.directory.service.HospitalService;
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
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
@Validated
@Tag(name = "Hospital API", description = "Endpoints for managing hospitals")
public class HospitalController {

    private final HospitalService hospitalService;
    private final HospitalMapper hospitalMapper;

    @PostMapping
    @Operation(summary = "Create a new hospital")
    public ResponseEntity<ApiResponse<HospitalResponse>> createHospital(@Valid @RequestBody HospitalRequest request) {
        Hospital entity = hospitalMapper.toEntity(request);
        Hospital savedEntity = hospitalService.createHospital(entity);
        
        ApiResponse<HospitalResponse> response = ApiResponse.<HospitalResponse>builder()
                .success(true)
                .message("Hospital created successfully")
                .data(hospitalMapper.toResponse(savedEntity))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all hospitals")
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> getAllHospitals() {
        List<Hospital> hospitals = hospitalService.getAllHospitals();
        
        ApiResponse<List<HospitalResponse>> response = ApiResponse.<List<HospitalResponse>>builder()
                .success(true)
                .message("Hospitals retrieved successfully")
                .data(hospitalMapper.toResponseList(hospitals))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a hospital by ID")
    public ResponseEntity<ApiResponse<HospitalResponse>> getHospitalById(@PathVariable UUID id) {
        return hospitalService.getHospitalById(id)
                .map(hospitalMapper::toResponse)
                .map(dto -> ApiResponse.<HospitalResponse>builder()
                        .success(true)
                        .message("Hospital retrieved successfully")
                        .data(dto)
                        .timestamp(LocalDateTime.now())
                        .build())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        ApiResponse.<HospitalResponse>builder()
                                .success(false)
                                .message("Hospital not found")
                                .timestamp(LocalDateTime.now())
                                .build()
                ));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a hospital")
    public ResponseEntity<ApiResponse<HospitalResponse>> updateHospital(
            @PathVariable UUID id,
            @Valid @RequestBody HospitalRequest request) {
        Hospital entityToUpdate = hospitalMapper.toEntity(request);
        Hospital updatedEntity = hospitalService.updateHospital(id, entityToUpdate);
        
        ApiResponse<HospitalResponse> response = ApiResponse.<HospitalResponse>builder()
                .success(true)
                .message("Hospital updated successfully")
                .data(hospitalMapper.toResponse(updatedEntity))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a hospital by ID")
    public ResponseEntity<ApiResponse<Void>> deleteHospital(@PathVariable UUID id) {
        hospitalService.deleteHospital(id);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Hospital deleted successfully")
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response);
    }
}

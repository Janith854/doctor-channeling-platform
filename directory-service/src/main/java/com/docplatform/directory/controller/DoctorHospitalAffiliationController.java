package com.docplatform.directory.controller;

import com.docplatform.directory.dto.mapper.DoctorHospitalAffiliationMapper;
import com.docplatform.directory.dto.request.DoctorHospitalAffiliationRequest;
import com.docplatform.directory.dto.response.DoctorHospitalAffiliationResponse;
import com.docplatform.directory.entity.DoctorHospitalAffiliation;
import com.docplatform.directory.entity.DoctorHospitalAffiliationId;
import com.docplatform.directory.payload.ApiResponse;
import com.docplatform.directory.service.DoctorHospitalAffiliationService;
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
@RequestMapping("/api/v1/affiliations")
@RequiredArgsConstructor
@Validated
@Tag(name = "Doctor-Hospital Affiliation API", description = "Endpoints for managing doctor-hospital affiliations")
public class DoctorHospitalAffiliationController {

    private final DoctorHospitalAffiliationService affiliationService;
    private final DoctorHospitalAffiliationMapper affiliationMapper;

    @PostMapping
    @Operation(summary = "Create a new affiliation")
    public ResponseEntity<ApiResponse<DoctorHospitalAffiliationResponse>> createAffiliation(@Valid @RequestBody DoctorHospitalAffiliationRequest request) {
        DoctorHospitalAffiliation entity = affiliationMapper.toEntity(request);
        DoctorHospitalAffiliation savedEntity = affiliationService.createAffiliation(entity);
        
        ApiResponse<DoctorHospitalAffiliationResponse> response = ApiResponse.<DoctorHospitalAffiliationResponse>builder()
                .success(true)
                .message("Affiliation created successfully")
                .data(affiliationMapper.toResponse(savedEntity))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get all affiliations")
    public ResponseEntity<ApiResponse<List<DoctorHospitalAffiliationResponse>>> getAllAffiliations() {
        List<DoctorHospitalAffiliation> affiliations = affiliationService.getAllAffiliations();
        
        ApiResponse<List<DoctorHospitalAffiliationResponse>> response = ApiResponse.<List<DoctorHospitalAffiliationResponse>>builder()
                .success(true)
                .message("Affiliations retrieved successfully")
                .data(affiliationMapper.toResponseList(affiliations))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response);
    }

                        @GetMapping("/hospital/{hospitalId}")
                        @Operation(summary = "Get affiliations by hospital ID")
                        public ResponseEntity<ApiResponse<List<DoctorHospitalAffiliationResponse>>> getAffiliationsByHospitalId(
                                        @PathVariable UUID hospitalId) {
                                List<DoctorHospitalAffiliation> affiliations = affiliationService.getAffiliationsByHospitalId(hospitalId);

                                ApiResponse<List<DoctorHospitalAffiliationResponse>> response = ApiResponse.<List<DoctorHospitalAffiliationResponse>>builder()
                                                .success(true)
                                                .message("Affiliations retrieved successfully")
                                                .data(affiliationMapper.toResponseList(affiliations))
                                                .timestamp(LocalDateTime.now())
                                                .build();

                                return ResponseEntity.ok(response);
                        }

    @GetMapping("/doctor/{doctorId}/hospital/{hospitalId}")
    @Operation(summary = "Get an affiliation by doctor and hospital IDs")
    public ResponseEntity<ApiResponse<DoctorHospitalAffiliationResponse>> getAffiliationById(
            @PathVariable UUID doctorId, 
            @PathVariable UUID hospitalId) {
        DoctorHospitalAffiliationId id = new DoctorHospitalAffiliationId(doctorId, hospitalId);
        return affiliationService.getAffiliationById(id)
                .map(affiliationMapper::toResponse)
                .map(dto -> ApiResponse.<DoctorHospitalAffiliationResponse>builder()
                        .success(true)
                        .message("Affiliation retrieved successfully")
                        .data(dto)
                        .timestamp(LocalDateTime.now())
                        .build())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        ApiResponse.<DoctorHospitalAffiliationResponse>builder()
                                .success(false)
                                .message("Affiliation not found")
                                .timestamp(LocalDateTime.now())
                                .build()
                ));
    }

    @PutMapping("/doctor/{doctorId}/hospital/{hospitalId}")
    @Operation(summary = "Update an affiliation")
    public ResponseEntity<ApiResponse<DoctorHospitalAffiliationResponse>> updateAffiliation(
            @PathVariable UUID doctorId, 
            @PathVariable UUID hospitalId,
            @Valid @RequestBody DoctorHospitalAffiliationRequest request) {
        DoctorHospitalAffiliationId id = new DoctorHospitalAffiliationId(doctorId, hospitalId);
        DoctorHospitalAffiliation entityToUpdate = affiliationMapper.toEntity(request);
        DoctorHospitalAffiliation updatedEntity = affiliationService.updateAffiliation(id, entityToUpdate);
        
        ApiResponse<DoctorHospitalAffiliationResponse> response = ApiResponse.<DoctorHospitalAffiliationResponse>builder()
                .success(true)
                .message("Affiliation updated successfully")
                .data(affiliationMapper.toResponse(updatedEntity))
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/doctor/{doctorId}/hospital/{hospitalId}")
    @Operation(summary = "Delete an affiliation")
    public ResponseEntity<ApiResponse<Void>> deleteAffiliation(
            @PathVariable UUID doctorId, 
            @PathVariable UUID hospitalId) {
        DoctorHospitalAffiliationId id = new DoctorHospitalAffiliationId(doctorId, hospitalId);
        affiliationService.deleteAffiliation(id);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Affiliation deleted successfully")
                .timestamp(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(response);
    }
}

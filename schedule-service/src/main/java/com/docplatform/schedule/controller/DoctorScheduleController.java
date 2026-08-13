package com.docplatform.schedule.controller;

import com.docplatform.schedule.dto.mapper.DoctorScheduleMapper;
import com.docplatform.schedule.dto.request.DoctorScheduleRequest;
import com.docplatform.schedule.dto.response.DoctorScheduleResponse;
import com.docplatform.schedule.entity.DoctorSchedule;
import com.docplatform.schedule.payload.ApiResponse;
import com.docplatform.schedule.service.DoctorScheduleService;
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
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Validated
@Tag(name = "Doctor Schedule API", description = "Endpoints for managing doctor weekly schedules")
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;
    private final DoctorScheduleMapper doctorScheduleMapper;

    @PostMapping
    @Operation(summary = "Create a new doctor schedule")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> createSchedule(
            @Valid @RequestBody DoctorScheduleRequest request) {
        DoctorSchedule entity = doctorScheduleMapper.toEntity(request);
        DoctorSchedule saved = doctorScheduleService.createSchedule(entity);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<DoctorScheduleResponse>builder()
                        .success(true)
                        .message("Schedule created successfully")
                        .data(doctorScheduleMapper.toResponse(saved))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping
    @Operation(summary = "Get all doctor schedules")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getAllSchedules() {
        List<DoctorSchedule> schedules = doctorScheduleService.getAllSchedules();

        return ResponseEntity.ok(
                ApiResponse.<List<DoctorScheduleResponse>>builder()
                        .success(true)
                        .message("Schedules retrieved successfully")
                        .data(doctorScheduleMapper.toResponseList(schedules))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a schedule by ID")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> getScheduleById(@PathVariable UUID id) {
        DoctorSchedule schedule = doctorScheduleService.getScheduleById(id);

        return ResponseEntity.ok(
                ApiResponse.<DoctorScheduleResponse>builder()
                        .success(true)
                        .message("Schedule retrieved successfully")
                        .data(doctorScheduleMapper.toResponse(schedule))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get all schedules for a specific doctor")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getSchedulesByDoctor(
            @PathVariable UUID doctorId) {
        List<DoctorSchedule> schedules = doctorScheduleService.getSchedulesByDoctor(doctorId);

        return ResponseEntity.ok(
                ApiResponse.<List<DoctorScheduleResponse>>builder()
                        .success(true)
                        .message("Doctor schedules retrieved successfully")
                        .data(doctorScheduleMapper.toResponseList(schedules))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/hospital/{hospitalId}")
    @Operation(summary = "Get all schedules for a specific hospital")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getSchedulesByHospital(
            @PathVariable UUID hospitalId) {
        List<DoctorSchedule> schedules = doctorScheduleService.getSchedulesByHospital(hospitalId);

        return ResponseEntity.ok(
                ApiResponse.<List<DoctorScheduleResponse>>builder()
                        .success(true)
                        .message("Hospital schedules retrieved successfully")
                        .data(doctorScheduleMapper.toResponseList(schedules))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a doctor schedule")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> updateSchedule(
            @PathVariable UUID id,
            @Valid @RequestBody DoctorScheduleRequest request) {
        DoctorSchedule entityToUpdate = doctorScheduleMapper.toEntity(request);
        DoctorSchedule updated = doctorScheduleService.updateSchedule(id, entityToUpdate);

        return ResponseEntity.ok(
                ApiResponse.<DoctorScheduleResponse>builder()
                        .success(true)
                        .message("Schedule updated successfully")
                        .data(doctorScheduleMapper.toResponse(updated))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a doctor schedule by ID")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable UUID id) {
        doctorScheduleService.deleteSchedule(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Schedule deleted successfully")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a doctor schedule")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> activateSchedule(@PathVariable UUID id) {
        DoctorSchedule schedule = doctorScheduleService.activateSchedule(id);

        return ResponseEntity.ok(
                ApiResponse.<DoctorScheduleResponse>builder()
                        .success(true)
                        .message("Schedule activated successfully")
                        .data(doctorScheduleMapper.toResponse(schedule))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a doctor schedule")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> deactivateSchedule(@PathVariable UUID id) {
        DoctorSchedule schedule = doctorScheduleService.deactivateSchedule(id);

        return ResponseEntity.ok(
                ApiResponse.<DoctorScheduleResponse>builder()
                        .success(true)
                        .message("Schedule deactivated successfully")
                        .data(doctorScheduleMapper.toResponse(schedule))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}

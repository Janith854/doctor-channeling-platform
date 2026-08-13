package com.docplatform.schedule.controller;

import com.docplatform.schedule.dto.mapper.AppointmentSlotMapper;
import com.docplatform.schedule.dto.request.AppointmentSlotRequest;
import com.docplatform.schedule.dto.request.SlotStatusUpdateRequest;
import com.docplatform.schedule.dto.response.AppointmentSlotResponse;
import com.docplatform.schedule.entity.AppointmentSlot;
import com.docplatform.schedule.payload.ApiResponse;
import com.docplatform.schedule.service.AppointmentSlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/slots")
@RequiredArgsConstructor
@Validated
@Tag(name = "Appointment Slot API", description = "Endpoints for managing appointment slots")
public class AppointmentSlotController {

    private final AppointmentSlotService appointmentSlotService;
    private final AppointmentSlotMapper appointmentSlotMapper;

    @PostMapping("/generate")
    @Operation(summary = "Generate appointment slots for a schedule on a given date")
    public ResponseEntity<ApiResponse<List<AppointmentSlotResponse>>> generateSlots(
            @Valid @RequestBody AppointmentSlotRequest request) {
        List<AppointmentSlot> slots = appointmentSlotService.generateSlots(
                request.getScheduleId(), request.getSlotDate());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<List<AppointmentSlotResponse>>builder()
                        .success(true)
                        .message("Appointment slots generated successfully")
                        .data(appointmentSlotMapper.toResponseList(slots))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an appointment slot by ID")
    public ResponseEntity<ApiResponse<AppointmentSlotResponse>> getSlotById(@PathVariable UUID id) {
        AppointmentSlot slot = appointmentSlotService.getSlotById(id);

        return ResponseEntity.ok(
                ApiResponse.<AppointmentSlotResponse>builder()
                        .success(true)
                        .message("Slot retrieved successfully")
                        .data(appointmentSlotMapper.toResponse(slot))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get all appointment slots for a doctor")
    public ResponseEntity<ApiResponse<List<AppointmentSlotResponse>>> getSlotsByDoctor(
            @PathVariable UUID doctorId) {
        List<AppointmentSlot> slots = appointmentSlotService.getSlotsByDoctor(doctorId);

        return ResponseEntity.ok(
                ApiResponse.<List<AppointmentSlotResponse>>builder()
                        .success(true)
                        .message("Slots retrieved successfully")
                        .data(appointmentSlotMapper.toResponseList(slots))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/doctor/{doctorId}/date/{date}")
    @Operation(summary = "Get appointment slots for a doctor on a specific date")
    public ResponseEntity<ApiResponse<List<AppointmentSlotResponse>>> getSlotsByDoctorAndDate(
            @PathVariable UUID doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentSlot> slots = appointmentSlotService.getSlotsByDoctorAndDate(doctorId, date);

        return ResponseEntity.ok(
                ApiResponse.<List<AppointmentSlotResponse>>builder()
                        .success(true)
                        .message("Slots retrieved successfully")
                        .data(appointmentSlotMapper.toResponseList(slots))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/available/{doctorId}/{date}")
    @Operation(summary = "Get available appointment slots for a doctor on a specific date")
    public ResponseEntity<ApiResponse<List<AppointmentSlotResponse>>> getAvailableSlots(
            @PathVariable UUID doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentSlot> slots = appointmentSlotService.getAvailableSlots(doctorId, date);

        return ResponseEntity.ok(
                ApiResponse.<List<AppointmentSlotResponse>>builder()
                        .success(true)
                        .message("Available slots retrieved successfully")
                        .data(appointmentSlotMapper.toResponseList(slots))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update the status of an appointment slot")
    public ResponseEntity<ApiResponse<AppointmentSlotResponse>> updateSlotStatus(
            @PathVariable UUID id,
            @Valid @RequestBody SlotStatusUpdateRequest request) {
        AppointmentSlot updated = appointmentSlotService.updateSlotStatus(id, request.getStatus());

        return ResponseEntity.ok(
                ApiResponse.<AppointmentSlotResponse>builder()
                        .success(true)
                        .message("Slot status updated successfully")
                        .data(appointmentSlotMapper.toResponse(updated))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}

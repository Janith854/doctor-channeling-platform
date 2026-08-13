package com.docplatform.booking.controller;

import com.docplatform.booking.dto.request.AppointmentRequest;
import com.docplatform.booking.dto.request.CancelAppointmentRequest;
import com.docplatform.booking.dto.request.RescheduleAppointmentRequest;
import com.docplatform.booking.dto.response.ApiResponse;
import com.docplatform.booking.dto.response.AppointmentResponse;
import com.docplatform.booking.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointment Management", description = "Endpoints for managing doctor appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @Operation(summary = "Create a new appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse data = appointmentService.createAppointment(request);
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment created successfully")
                .data(data)
                .build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable UUID id) {
        AppointmentResponse data = appointmentService.getAppointmentById(id);
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment retrieved successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/number/{appointmentNumber}")
    @Operation(summary = "Get appointment by appointment number")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getByAppointmentNumber(@PathVariable String appointmentNumber) {
        AppointmentResponse data = appointmentService.getByAppointmentNumber(appointmentNumber);
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment retrieved successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get appointments for a patient")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getPatientAppointments(@PathVariable UUID patientId) {
        List<AppointmentResponse> data = appointmentService.getPatientAppointments(patientId);
        ApiResponse<List<AppointmentResponse>> response = ApiResponse.<List<AppointmentResponse>>builder()
                .success(true)
                .message("Patient appointments retrieved successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get appointments for a doctor")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDoctorAppointments(@PathVariable UUID doctorId) {
        List<AppointmentResponse> data = appointmentService.getDoctorAppointments(doctorId);
        ApiResponse<List<AppointmentResponse>> response = ApiResponse.<List<AppointmentResponse>>builder()
                .success(true)
                .message("Doctor appointments retrieved successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/hospital/{hospitalId}")
    @Operation(summary = "Get appointments for a hospital")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getHospitalAppointments(@PathVariable UUID hospitalId) {
        List<AppointmentResponse> data = appointmentService.getHospitalAppointments(hospitalId);
        ApiResponse<List<AppointmentResponse>> response = ApiResponse.<List<AppointmentResponse>>builder()
                .success(true)
                .message("Hospital appointments retrieved successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/confirm")
    @Operation(summary = "Confirm appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirmAppointment(@PathVariable UUID id) {
        AppointmentResponse data = appointmentService.confirmAppointment(id);
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment confirmed successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @PathVariable UUID id,
            @RequestBody(required = false) CancelAppointmentRequest request) {
        AppointmentResponse data = appointmentService.cancelAppointment(id, request);
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment cancelled successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Complete appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> completeAppointment(@PathVariable UUID id) {
        AppointmentResponse data = appointmentService.completeAppointment(id);
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment marked as completed successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/no-show")
    @Operation(summary = "Mark appointment as no-show")
    public ResponseEntity<ApiResponse<AppointmentResponse>> markNoShow(@PathVariable UUID id) {
        AppointmentResponse data = appointmentService.markNoShow(id);
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment marked as NO_SHOW successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rescheduleAppointment(
            @PathVariable UUID id,
            @Valid @RequestBody RescheduleAppointmentRequest request) {
        AppointmentResponse data = appointmentService.rescheduleAppointment(id, request);
        ApiResponse<AppointmentResponse> response = ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment rescheduled successfully")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete appointment")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable UUID id) {
        appointmentService.deleteAppointment(id);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(true)
                .message("Appointment deleted successfully")
                .build();
        return ResponseEntity.ok(response);
    }
}

package com.docplatform.notification.controller;

import com.docplatform.notification.dto.mapper.NotificationMapper;
import com.docplatform.notification.dto.request.EmailNotificationRequest;
import com.docplatform.notification.dto.request.NotificationRequest;
import com.docplatform.notification.dto.response.NotificationResponse;
import com.docplatform.notification.entity.Notification;
import com.docplatform.notification.entity.NotificationChannel;
import com.docplatform.notification.entity.NotificationStatus;
import com.docplatform.notification.payload.ApiResponse;
import com.docplatform.notification.service.EmailService;
import com.docplatform.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Notification API", description = "Endpoints for managing and sending notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final NotificationMapper notificationMapper;

    @PostMapping
    @Operation(summary = "Create a new notification")
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(
            @Valid @RequestBody NotificationRequest request) {
        Notification notification = notificationMapper.toEntity(request);
        Notification saved = notificationService.createNotification(notification);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<NotificationResponse>builder()
                        .success(true)
                        .message("Notification created successfully")
                        .data(notificationMapper.toResponse(saved))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a notification by ID")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(@PathVariable UUID id) {
        Notification notification = notificationService.getNotificationById(id);

        return ResponseEntity.ok(
                ApiResponse.<NotificationResponse>builder()
                        .success(true)
                        .message("Notification retrieved successfully")
                        .data(notificationMapper.toResponse(notification))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all notifications for a user")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications(
            @PathVariable UUID userId) {
        List<Notification> notifications = notificationService.getUserNotifications(userId);

        return ResponseEntity.ok(
                ApiResponse.<List<NotificationResponse>>builder()
                        .success(true)
                        .message("User notifications retrieved successfully")
                        .data(notificationMapper.toResponseList(notifications))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PatchMapping("/{id}/sent")
    @Operation(summary = "Mark a notification as sent")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsSent(@PathVariable UUID id) {
        Notification notification = notificationService.markAsSent(id);

        return ResponseEntity.ok(
                ApiResponse.<NotificationResponse>builder()
                        .success(true)
                        .message("Notification marked as sent successfully")
                        .data(notificationMapper.toResponse(notification))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PatchMapping("/{id}/failed")
    @Operation(summary = "Mark a notification as failed")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsFailed(@PathVariable UUID id) {
        Notification notification = notificationService.markAsFailed(id);

        return ResponseEntity.ok(
                ApiResponse.<NotificationResponse>builder()
                        .success(true)
                        .message("Notification marked as failed successfully")
                        .data(notificationMapper.toResponse(notification))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification by ID")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable UUID id) {
        notificationService.deleteNotification(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Notification deleted successfully")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/email")
    @Operation(summary = "Send an email notification directly")
    public ResponseEntity<ApiResponse<NotificationResponse>> sendEmailNotification(
            @Valid @RequestBody EmailNotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .recipient(request.getRecipient())
                .subject(request.getSubject())
                .message(request.getBody())
                .type(request.getType())
                .channel(NotificationChannel.EMAIL)
                .status(NotificationStatus.PENDING)
                .build();

        Notification saved = notificationService.createNotification(notification);

        try {
            emailService.sendEmail(request.getRecipient(), request.getSubject(), request.getBody());
            saved = notificationService.markAsSent(saved.getId());
        } catch (Exception e) {
            log.error("Failed to send email notification to: {}", request.getRecipient(), e);
            saved = notificationService.markAsFailed(saved.getId());
            throw e;
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<NotificationResponse>builder()
                        .success(true)
                        .message("Email notification sent successfully")
                        .data(notificationMapper.toResponse(saved))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}

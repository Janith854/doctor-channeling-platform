package com.docplatform.notification.service;

import com.docplatform.notification.entity.Notification;
import com.docplatform.notification.entity.NotificationChannel;
import com.docplatform.notification.entity.NotificationStatus;
import com.docplatform.notification.entity.NotificationType;
import com.docplatform.notification.exception.ResourceNotFoundException;
import com.docplatform.notification.repository.NotificationRepository;
import com.docplatform.notification.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Unit Tests")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private UUID notificationId;
    private UUID userId;
    private Notification notification;

    @BeforeEach
    void setUp() {
        notificationId = UUID.randomUUID();
        userId = UUID.randomUUID();

        notification = Notification.builder()
                .id(notificationId)
                .userId(userId)
                .recipient("patient@example.com")
                .subject("Appointment Confirmed")
                .message("Your appointment has been confirmed.")
                .type(NotificationType.APPOINTMENT_CONFIRMED)
                .channel(NotificationChannel.EMAIL)
                .status(NotificationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("createNotification - should save and return notification")
    void createNotification_shouldSaveAndReturn() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Notification result = notificationService.createNotification(notification);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(notificationId);
        assertThat(result.getStatus()).isEqualTo(NotificationStatus.PENDING);
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    @DisplayName("getNotificationById - should return notification when found")
    void getNotificationById_shouldReturn_whenFound() {
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));

        Notification result = notificationService.getNotificationById(notificationId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(notificationId);
    }

    @Test
    @DisplayName("getNotificationById - should throw ResourceNotFoundException when not found")
    void getNotificationById_shouldThrow_whenNotFound() {
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.getNotificationById(notificationId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Notification not found with id: " + notificationId);
    }

    @Test
    @DisplayName("getUserNotifications - should return notifications for user")
    void getUserNotifications_shouldReturnNotifications() {
        when(notificationRepository.findByUserId(userId)).thenReturn(List.of(notification));

        List<Notification> result = notificationService.getUserNotifications(userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(userId);
    }

    @Test
    @DisplayName("getPendingNotifications - should return notifications with PENDING status")
    void getPendingNotifications_shouldReturnPending() {
        when(notificationRepository.findByStatus(NotificationStatus.PENDING)).thenReturn(List.of(notification));

        List<Notification> result = notificationService.getPendingNotifications();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(NotificationStatus.PENDING);
    }

    @Test
    @DisplayName("markAsSent - should update status to SENT and set sentAt")
    void markAsSent_shouldUpdateStatusToSent() {
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        Notification result = notificationService.markAsSent(notificationId);

        assertThat(result.getStatus()).isEqualTo(NotificationStatus.SENT);
        assertThat(result.getSentAt()).isNotNull();
    }

    @Test
    @DisplayName("markAsFailed - should update status to FAILED")
    void markAsFailed_shouldUpdateStatusToFailed() {
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        Notification result = notificationService.markAsFailed(notificationId);

        assertThat(result.getStatus()).isEqualTo(NotificationStatus.FAILED);
    }

    @Test
    @DisplayName("deleteNotification - should delete when exists")
    void deleteNotification_shouldDelete_whenExists() {
        when(notificationRepository.existsById(notificationId)).thenReturn(true);
        doNothing().when(notificationRepository).deleteById(notificationId);

        assertThatCode(() -> notificationService.deleteNotification(notificationId))
                .doesNotThrowAnyException();

        verify(notificationRepository, times(1)).deleteById(notificationId);
    }

    @Test
    @DisplayName("deleteNotification - should throw ResourceNotFoundException when not found")
    void deleteNotification_shouldThrow_whenNotFound() {
        when(notificationRepository.existsById(notificationId)).thenReturn(false);

        assertThatThrownBy(() -> notificationService.deleteNotification(notificationId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(notificationRepository, never()).deleteById(any());
    }
}

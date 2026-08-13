package com.docplatform.notification.service.impl;

import com.docplatform.notification.entity.Notification;
import com.docplatform.notification.entity.NotificationStatus;
import com.docplatform.notification.exception.ResourceNotFoundException;
import com.docplatform.notification.repository.NotificationRepository;
import com.docplatform.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public Notification createNotification(Notification notification) {
        log.info("Creating notification for recipient: {} with type: {} and channel: {}",
                notification.getRecipient(), notification.getType(), notification.getChannel());
        if (notification.getStatus() == null) {
            notification.setStatus(NotificationStatus.PENDING);
        }
        try {
            Notification saved = notificationRepository.save(notification);
            log.info("Notification created with ID: {}", saved.getId());
            return saved;
        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Notification getNotificationById(UUID id) {
        log.info("Fetching notification with ID: {}", id);
        return notificationRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Notification not found with ID: {}", id);
                    return new ResourceNotFoundException("Notification not found with id: " + id);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(UUID userId) {
        log.info("Fetching notifications for user ID: {}", userId);
        return notificationRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getPendingNotifications() {
        log.info("Fetching all pending notifications");
        return notificationRepository.findByStatus(NotificationStatus.PENDING);
    }

    @Override
    @Transactional
    public Notification markAsSent(UUID id) {
        log.info("Marking notification with ID: {} as SENT", id);
        Notification notification = getNotificationById(id);
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(notification);
        log.info("Notification with ID {} marked as SENT", id);
        return saved;
    }

    @Override
    @Transactional
    public Notification markAsFailed(UUID id) {
        log.info("Marking notification with ID: {} as FAILED", id);
        Notification notification = getNotificationById(id);
        notification.setStatus(NotificationStatus.FAILED);
        Notification saved = notificationRepository.save(notification);
        log.info("Notification with ID {} marked as FAILED", id);
        return saved;
    }

    @Override
    @Transactional
    public void deleteNotification(UUID id) {
        log.info("Deleting notification with ID: {}", id);
        if (!notificationRepository.existsById(id)) {
            log.warn("Notification with ID {} does not exist, skipping deletion", id);
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
        log.info("Successfully deleted notification with ID: {}", id);
    }
}

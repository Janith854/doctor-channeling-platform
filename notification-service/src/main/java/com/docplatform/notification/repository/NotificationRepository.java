package com.docplatform.notification.repository;

import com.docplatform.notification.entity.Notification;
import com.docplatform.notification.entity.NotificationChannel;
import com.docplatform.notification.entity.NotificationStatus;
import com.docplatform.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUserId(UUID userId);

    List<Notification> findByStatus(NotificationStatus status);

    List<Notification> findByType(NotificationType type);

    List<Notification> findByChannel(NotificationChannel channel);
}

package com.docplatform.notification.service;

import com.docplatform.notification.entity.Notification;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    Notification createNotification(Notification notification);

    Notification getNotificationById(UUID id);

    List<Notification> getUserNotifications(UUID userId);

    List<Notification> getPendingNotifications();

    Notification markAsSent(UUID id);

    Notification markAsFailed(UUID id);

    void deleteNotification(UUID id);
}

package com.docplatform.notification.dto.mapper;

import com.docplatform.notification.dto.request.NotificationRequest;
import com.docplatform.notification.dto.response.NotificationResponse;
import com.docplatform.notification.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationResponse toResponse(Notification notification);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "sentAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Notification toEntity(NotificationRequest request);

    List<NotificationResponse> toResponseList(List<Notification> notifications);
}

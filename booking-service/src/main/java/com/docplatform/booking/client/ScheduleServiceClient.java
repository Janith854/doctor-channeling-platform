package com.docplatform.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "schedule-service", url = "${application.config.schedule-service-url:http://localhost:8083}")
public interface ScheduleServiceClient {

    @GetMapping("/api/v1/schedules/slots/{slotId}")
    Object getSlotById(@PathVariable("slotId") UUID slotId);
}

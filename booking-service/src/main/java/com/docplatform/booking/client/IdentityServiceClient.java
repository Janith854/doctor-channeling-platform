package com.docplatform.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "identity-service", url = "${application.config.identity-service-url:http://localhost:8081}")
public interface IdentityServiceClient {

    @GetMapping("/api/v1/users/{id}")
    Object getUserById(@PathVariable("id") UUID id);
}

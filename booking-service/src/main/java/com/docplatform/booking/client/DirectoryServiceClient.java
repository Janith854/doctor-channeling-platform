package com.docplatform.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "directory-service", url = "${application.config.directory-service-url:http://localhost:8082}")
public interface DirectoryServiceClient {

    @GetMapping("/api/v1/doctors/{id}")
    Object getDoctorById(@PathVariable("id") UUID id);

    @GetMapping("/api/v1/hospitals/{id}")
    Object getHospitalById(@PathVariable("id") UUID id);
}

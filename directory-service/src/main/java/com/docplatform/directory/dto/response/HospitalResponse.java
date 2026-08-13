package com.docplatform.directory.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalResponse {
    private UUID id;
    private String name;
    private String address;
    private String city;
    private String type;
    private Double geoLat;
    private Double geoLng;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

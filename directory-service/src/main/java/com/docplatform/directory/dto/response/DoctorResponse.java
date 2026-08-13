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
public class DoctorResponse {
    private UUID id;
    private UUID userId;
    private String fullName;
    private SpecializationResponse specialization;
    private String qualifications;
    private String slmcNumber;
    private String bio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.docplatform.directory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Full name is required")
    @Size(max = 200, message = "Full name must not exceed 200 characters")
    private String fullName;

    @NotNull(message = "Specialization ID is required")
    private UUID specializationId;

    @Size(max = 500, message = "Qualifications must not exceed 500 characters")
    private String qualifications;

    @Size(max = 100, message = "SLMC number must not exceed 100 characters")
    private String slmcNumber;

    private String bio;
}

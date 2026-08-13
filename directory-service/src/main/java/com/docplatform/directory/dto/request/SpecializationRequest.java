package com.docplatform.directory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecializationRequest {

    @NotBlank(message = "Specialization name is required")
    @Size(max = 100, message = "Specialization name must not exceed 100 characters")
    private String name;
}

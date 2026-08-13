package com.docplatform.directory.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorHospitalAffiliationResponse {
    private UUID doctorId;
    private UUID hospitalId;
    private String doctorName;
    private String hospitalName;
}

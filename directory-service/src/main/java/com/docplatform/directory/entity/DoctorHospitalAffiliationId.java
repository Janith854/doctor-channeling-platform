package com.docplatform.directory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorHospitalAffiliationId implements Serializable {

    @Column(name = "doctor_id")
    private UUID doctorId;

    @Column(name = "hospital_id")
    private UUID hospitalId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DoctorHospitalAffiliationId that = (DoctorHospitalAffiliationId) o;
        return Objects.equals(doctorId, that.doctorId) && Objects.equals(hospitalId, that.hospitalId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(doctorId, hospitalId);
    }
}

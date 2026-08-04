package com.docplatform.directory.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctor_hospital_affiliations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorHospitalAffiliation {

    @EmbeddedId
    private DoctorHospitalAffiliationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("doctorId")
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("hospitalId")
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;

    public DoctorHospitalAffiliation(Doctor doctor, Hospital hospital) {
        this.doctor = doctor;
        this.hospital = hospital;
        this.id = new DoctorHospitalAffiliationId(doctor.getId(), hospital.getId());
    }
}

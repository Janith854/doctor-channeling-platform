package com.docplatform.directory.repository;

import com.docplatform.directory.entity.DoctorHospitalAffiliation;
import com.docplatform.directory.entity.DoctorHospitalAffiliationId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DoctorHospitalAffiliationRepository extends JpaRepository<DoctorHospitalAffiliation, DoctorHospitalAffiliationId> {

    List<DoctorHospitalAffiliation> findByDoctorId(UUID doctorId);

    List<DoctorHospitalAffiliation> findByHospitalId(UUID hospitalId);
}
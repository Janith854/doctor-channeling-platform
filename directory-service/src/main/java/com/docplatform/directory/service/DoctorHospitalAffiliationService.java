package com.docplatform.directory.service;

import com.docplatform.directory.entity.DoctorHospitalAffiliation;
import com.docplatform.directory.entity.DoctorHospitalAffiliationId;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorHospitalAffiliationService {

    DoctorHospitalAffiliation createAffiliation(DoctorHospitalAffiliation affiliation);

    DoctorHospitalAffiliation updateAffiliation(DoctorHospitalAffiliationId id, DoctorHospitalAffiliation affiliation);

    Optional<DoctorHospitalAffiliation> getAffiliationById(DoctorHospitalAffiliationId id);

    List<DoctorHospitalAffiliation> getAllAffiliations();


    List<DoctorHospitalAffiliation> getAffiliationsByHospitalId(UUID hospitalId);

    void deleteAffiliation(DoctorHospitalAffiliationId id);
}


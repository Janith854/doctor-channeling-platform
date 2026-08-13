package com.docplatform.directory.service;

import com.docplatform.directory.entity.Hospital;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HospitalService {

    Hospital createHospital(Hospital hospital);

    Hospital updateHospital(UUID id, Hospital hospital);

    Optional<Hospital> getHospitalById(UUID id);

    List<Hospital> getAllHospitals();

    void deleteHospital(UUID id);
}

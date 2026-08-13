package com.docplatform.directory.service.impl;

import com.docplatform.directory.entity.Hospital;
import com.docplatform.directory.exception.ResourceNotFoundException;
import com.docplatform.directory.repository.HospitalRepository;
import com.docplatform.directory.service.HospitalService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class HospitalServiceImpl implements HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalServiceImpl(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    @Override
    public Hospital createHospital(Hospital hospital) {
        log.info("Creating a new hospital with name: {}", hospital.getName());
        try {
            return hospitalRepository.save(hospital);
        } catch (Exception e) {
            log.error("Error occurred while creating hospital: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Hospital updateHospital(UUID id, Hospital hospital) {
        log.info("Updating hospital with ID: {}", id);
        Hospital existingHospital = hospitalRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Hospital with ID {} not found for update", id);
                    return new ResourceNotFoundException("Hospital not found with id: " + id);
                });

        hospital.setId(existingHospital.getId());

        try {
            return hospitalRepository.save(hospital);
        } catch (Exception e) {
            log.error("Error occurred while updating hospital with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Optional<Hospital> getHospitalById(UUID id) {
        log.info("Fetching hospital with ID: {}", id);
        return hospitalRepository.findById(id);
    }

    @Override
    public List<Hospital> getAllHospitals() {
        log.info("Fetching all hospitals");
        return hospitalRepository.findAll();
    }

    @Override
    public void deleteHospital(UUID id) {
        log.info("Deleting hospital with ID: {}", id);
        if (!hospitalRepository.existsById(id)) {
            log.warn("Hospital with ID {} does not exist, skipping deletion", id);
            throw new ResourceNotFoundException("Hospital not found with id: " + id);
        }
        hospitalRepository.deleteById(id);
        log.info("Successfully deleted hospital with ID: {}", id);
    }
}

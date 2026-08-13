package com.docplatform.directory.service.impl;

import com.docplatform.directory.entity.DoctorHospitalAffiliation;
import com.docplatform.directory.entity.DoctorHospitalAffiliationId;
import com.docplatform.directory.exception.ResourceNotFoundException;
import com.docplatform.directory.repository.DoctorHospitalAffiliationRepository;
import com.docplatform.directory.service.DoctorHospitalAffiliationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class DoctorHospitalAffiliationServiceImpl implements DoctorHospitalAffiliationService {

    private final DoctorHospitalAffiliationRepository affiliationRepository;

    public DoctorHospitalAffiliationServiceImpl(
            DoctorHospitalAffiliationRepository affiliationRepository) {
        this.affiliationRepository = affiliationRepository;
    }

    @Override
    public DoctorHospitalAffiliation createAffiliation(
            DoctorHospitalAffiliation affiliation) {
        log.info("Creating a new affiliation between doctor ID {} and hospital ID {}", 
                affiliation.getId().getDoctorId(), affiliation.getId().getHospitalId());
        try {
            return affiliationRepository.save(affiliation);
        } catch (Exception e) {
            log.error("Error occurred while creating affiliation: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public DoctorHospitalAffiliation updateAffiliation(
            DoctorHospitalAffiliationId id,
            DoctorHospitalAffiliation affiliation) {
        
        log.info("Updating affiliation for doctor ID {} and hospital ID {}", id.getDoctorId(), id.getHospitalId());
        DoctorHospitalAffiliation existing =
                affiliationRepository.findById(id)
                        .orElseThrow(() -> {
                            log.error("Affiliation with ID {} not found for update", id);
                            return new ResourceNotFoundException("Affiliation not found");
                        });

        affiliation.setId(existing.getId());

        try {
            return affiliationRepository.save(affiliation);
        } catch (Exception e) {
            log.error("Error occurred while updating affiliation: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Optional<DoctorHospitalAffiliation> getAffiliationById(DoctorHospitalAffiliationId id) {
        log.info("Fetching affiliation for doctor ID {} and hospital ID {}", id.getDoctorId(), id.getHospitalId());
        return affiliationRepository.findById(id);
    }

    @Override
    public List<DoctorHospitalAffiliation> getAllAffiliations() {
        log.info("Fetching all affiliations");
        return affiliationRepository.findAll();
    }

    @Override
    public List<DoctorHospitalAffiliation> getAffiliationsByHospitalId(UUID hospitalId) {
        log.info("Fetching affiliations for hospital ID {}", hospitalId);
        return affiliationRepository.findByHospitalId(hospitalId);
    }

    @Override
    public void deleteAffiliation(DoctorHospitalAffiliationId id) {
        log.info("Deleting affiliation for doctor ID {} and hospital ID {}", id.getDoctorId(), id.getHospitalId());
        if (!affiliationRepository.existsById(id)) {
            log.warn("Affiliation with ID {} does not exist, skipping deletion", id);
            throw new ResourceNotFoundException("Affiliation not found");
        }
        affiliationRepository.deleteById(id);
        log.info("Successfully deleted affiliation for doctor ID {} and hospital ID {}", id.getDoctorId(), id.getHospitalId());
    }
}

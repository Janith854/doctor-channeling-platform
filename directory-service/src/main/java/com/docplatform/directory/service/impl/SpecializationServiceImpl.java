package com.docplatform.directory.service.impl;

import com.docplatform.directory.entity.Specialization;
import com.docplatform.directory.exception.ResourceNotFoundException;
import com.docplatform.directory.repository.SpecializationRepository;
import com.docplatform.directory.service.SpecializationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class SpecializationServiceImpl implements SpecializationService {

    private final SpecializationRepository specializationRepository;

    public SpecializationServiceImpl(SpecializationRepository specializationRepository) {
        this.specializationRepository = specializationRepository;
    }

    @Override
    public Specialization createSpecialization(Specialization specialization) {
        log.info("Creating a new specialization with name: {}", specialization.getName());
        try {
            return specializationRepository.save(specialization);
        } catch (Exception e) {
            log.error("Error occurred while creating specialization: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Specialization updateSpecialization(UUID id, Specialization specialization) {
        log.info("Updating specialization with ID: {}", id);
        Specialization existing = specializationRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Specialization with ID {} not found for update", id);
                    return new ResourceNotFoundException("Specialization not found with id: " + id);
                });

        specialization.setId(existing.getId());

        try {
            return specializationRepository.save(specialization);
        } catch (Exception e) {
            log.error("Error occurred while updating specialization with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Optional<Specialization> getSpecializationById(UUID id) {
        log.info("Fetching specialization with ID: {}", id);
        return specializationRepository.findById(id);
    }

    @Override
    public List<Specialization> getAllSpecializations() {
        log.info("Fetching all specializations");
        return specializationRepository.findAll();
    }

    @Override
    public void deleteSpecialization(UUID id) {
        log.info("Deleting specialization with ID: {}", id);
        if (!specializationRepository.existsById(id)) {
            log.warn("Specialization with ID {} does not exist, skipping deletion", id);
            throw new ResourceNotFoundException("Specialization not found with id: " + id);
        }
        specializationRepository.deleteById(id);
        log.info("Successfully deleted specialization with ID: {}", id);
    }
}

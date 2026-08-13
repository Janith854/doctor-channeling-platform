package com.docplatform.directory.service.impl;

import com.docplatform.directory.entity.Doctor;
import com.docplatform.directory.exception.ResourceNotFoundException;
import com.docplatform.directory.repository.DoctorRepository;
import com.docplatform.directory.service.DoctorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorServiceImpl(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Override
    public Doctor createDoctor(Doctor doctor) {
        log.info("Creating a new doctor with user ID: {}", doctor.getUserId());
        try {
            return doctorRepository.save(doctor);
        } catch (Exception e) {
            log.error("Error occurred while creating doctor: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Doctor updateDoctor(UUID id, Doctor doctor) {
        log.info("Updating doctor with ID: {}", id);
        Doctor existingDoctor = doctorRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Doctor with ID {} not found for update", id);
                    return new ResourceNotFoundException("Doctor not found with id: " + id);
                });

        doctor.setId(existingDoctor.getId());

        try {
            return doctorRepository.save(doctor);
        } catch (Exception e) {
            log.error("Error occurred while updating doctor with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Optional<Doctor> getDoctorById(UUID id) {
        log.info("Fetching doctor with ID: {}", id);
        return doctorRepository.findById(id);
    }

    @Override
    public List<Doctor> getAllDoctors() {
        log.info("Fetching all doctors");
        return doctorRepository.findAll();
    }

    @Override
    public void deleteDoctor(UUID id) {
        log.info("Deleting doctor with ID: {}", id);
        if (!doctorRepository.existsById(id)) {
            log.warn("Doctor with ID {} does not exist, skipping deletion", id);
            throw new ResourceNotFoundException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
        log.info("Successfully deleted doctor with ID: {}", id);
    }
}

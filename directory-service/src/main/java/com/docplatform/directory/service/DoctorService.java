package com.docplatform.directory.service;

import com.docplatform.directory.entity.Doctor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorService {

    Doctor createDoctor(Doctor doctor);

    Doctor updateDoctor(UUID id, Doctor doctor);

    Optional<Doctor> getDoctorById(UUID id);

    List<Doctor> getAllDoctors();

    void deleteDoctor(UUID id);
}

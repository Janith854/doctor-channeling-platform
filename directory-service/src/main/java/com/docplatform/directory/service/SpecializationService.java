package com.docplatform.directory.service;

import com.docplatform.directory.entity.Specialization;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpecializationService {

    Specialization createSpecialization(Specialization specialization);

    Specialization updateSpecialization(UUID id, Specialization specialization);

    Optional<Specialization> getSpecializationById(UUID id);

    List<Specialization> getAllSpecializations();

    void deleteSpecialization(UUID id);
}

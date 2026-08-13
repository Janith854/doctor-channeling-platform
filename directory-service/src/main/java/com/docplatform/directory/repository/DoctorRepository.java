package com.docplatform.directory.repository;

import com.docplatform.directory.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findBySlmcNumber(String slmcNumber);

    boolean existsBySlmcNumber(String slmcNumber);
}
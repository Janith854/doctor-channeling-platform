package com.docplatform.booking.repository;

import com.docplatform.booking.domain.entity.Appointment;
import com.docplatform.booking.domain.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    Optional<Appointment> findByAppointmentNumber(String appointmentNumber);

    List<Appointment> findByPatientId(UUID patientId);

    List<Appointment> findByDoctorId(UUID doctorId);

    List<Appointment> findByHospitalId(UUID hospitalId);

    List<Appointment> findByDoctorIdAndAppointmentDate(UUID doctorId, LocalDate appointmentDate);

    List<Appointment> findByPatientIdAndAppointmentDate(UUID patientId, LocalDate appointmentDate);

    List<Appointment> findByStatus(AppointmentStatus status);

    boolean existsByAppointmentNumber(String appointmentNumber);
}

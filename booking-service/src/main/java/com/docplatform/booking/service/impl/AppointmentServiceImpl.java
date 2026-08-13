package com.docplatform.booking.service.impl;

import com.docplatform.booking.domain.entity.Appointment;
import com.docplatform.booking.domain.enums.AppointmentStatus;
import com.docplatform.booking.dto.request.AppointmentRequest;
import com.docplatform.booking.dto.request.CancelAppointmentRequest;
import com.docplatform.booking.dto.request.RescheduleAppointmentRequest;
import com.docplatform.booking.dto.response.AppointmentResponse;
import com.docplatform.booking.exception.BadRequestException;
import com.docplatform.booking.exception.InvalidAppointmentStateException;
import com.docplatform.booking.exception.ResourceNotFoundException;
import com.docplatform.booking.mapper.AppointmentMapper;
import com.docplatform.booking.repository.AppointmentRepository;
import com.docplatform.booking.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;
    private final Random random = new Random();

    @Override
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        log.info("Creating appointment for patient: {}, doctor: {}, slot: {}",
                request.getPatientId(), request.getDoctorId(), request.getSlotId());

        if (request.getPatientId() == null || request.getDoctorId() == null ||
                request.getHospitalId() == null || request.getSlotId() == null) {
            throw new BadRequestException("Patient ID, Doctor ID, Hospital ID, and Slot ID must be provided");
        }

        Appointment appointment = appointmentMapper.toEntity(request);
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setAppointmentNumber(generateUniqueAppointmentNumber(request.getAppointmentDate()));

        Appointment savedAppointment = appointmentRepository.save(appointment);
        log.info("Successfully created appointment with number: {}", savedAppointment.getAppointmentNumber());
        return appointmentMapper.toDto(savedAppointment);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(UUID id) {
        log.info("Fetching appointment with id: {}", id);
        Appointment appointment = findAppointmentById(id);
        return appointmentMapper.toDto(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getByAppointmentNumber(String appointmentNumber) {
        log.info("Fetching appointment with number: {}", appointmentNumber);
        Appointment appointment = appointmentRepository.findByAppointmentNumber(appointmentNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with number: " + appointmentNumber));
        return appointmentMapper.toDto(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(UUID patientId) {
        log.info("Fetching appointments for patient: {}", patientId);
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        return appointmentMapper.toDtoList(appointments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments(UUID doctorId) {
        log.info("Fetching appointments for doctor: {}", doctorId);
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        return appointmentMapper.toDtoList(appointments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getHospitalAppointments(UUID hospitalId) {
        log.info("Fetching appointments for hospital: {}", hospitalId);
        List<Appointment> appointments = appointmentRepository.findByHospitalId(hospitalId);
        return appointmentMapper.toDtoList(appointments);
    }

    @Override
    public AppointmentResponse confirmAppointment(UUID id) {
        log.info("Confirming appointment id: {}", id);
        Appointment appointment = findAppointmentById(id);

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new InvalidAppointmentStateException(
                    "Only PENDING appointments can be confirmed. Current status: " + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updated);
    }

    @Override
    public AppointmentResponse cancelAppointment(UUID id, CancelAppointmentRequest request) {
        log.info("Cancelling appointment id: {}", id);
        Appointment appointment = findAppointmentById(id);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new InvalidAppointmentStateException(
                    "Cannot cancel an appointment with status: " + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        if (request != null && request.getReason() != null && !request.getReason().isBlank()) {
            appointment.setReason(request.getReason());
        }

        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updated);
    }

    @Override
    public AppointmentResponse completeAppointment(UUID id) {
        log.info("Completing appointment id: {}", id);
        Appointment appointment = findAppointmentById(id);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new InvalidAppointmentStateException(
                    "Only CONFIRMED appointments can be completed. Current status: " + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updated);
    }

    @Override
    public AppointmentResponse markNoShow(UUID id) {
        log.info("Marking appointment id as NO_SHOW: {}", id);
        Appointment appointment = findAppointmentById(id);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new InvalidAppointmentStateException(
                    "Cannot mark NO_SHOW for an appointment with status: " + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.NO_SHOW);
        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updated);
    }

    @Override
    public AppointmentResponse rescheduleAppointment(UUID id, RescheduleAppointmentRequest request) {
        log.info("Rescheduling appointment id: {}", id);
        Appointment appointment = findAppointmentById(id);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new InvalidAppointmentStateException(
                    "Cannot reschedule an appointment with status: " + appointment.getStatus());
        }

        appointment.setSlotId(request.getNewSlotId());
        appointment.setAppointmentDate(request.getNewAppointmentDate());
        appointment.setStartTime(request.getNewStartTime());
        appointment.setEndTime(request.getNewEndTime());
        appointment.setStatus(AppointmentStatus.RESCHEDULED);

        if (request.getReason() != null && !request.getReason().isBlank()) {
            appointment.setReason(request.getReason());
        }

        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updated);
    }

    @Override
    public void deleteAppointment(UUID id) {
        log.info("Deleting appointment id: {}", id);
        Appointment appointment = findAppointmentById(id);
        appointmentRepository.delete(appointment);
    }

    private Appointment findAppointmentById(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    private String generateUniqueAppointmentNumber(java.time.LocalDate date) {
        String datePart = date != null ? date.format(DATE_FORMATTER) : java.time.LocalDate.now().format(DATE_FORMATTER);
        String candidateNumber;
        int attempts = 0;
        do {
            int randomNum = 1000 + random.nextInt(9000);
            candidateNumber = "APP-" + datePart + "-" + randomNum;
            attempts++;
            if (attempts > 100) {
                candidateNumber = "APP-" + datePart + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
                break;
            }
        } while (appointmentRepository.existsByAppointmentNumber(candidateNumber));

        return candidateNumber;
    }
}

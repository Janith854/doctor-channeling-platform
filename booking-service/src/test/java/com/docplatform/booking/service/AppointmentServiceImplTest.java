package com.docplatform.booking.service;

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
import com.docplatform.booking.service.impl.AppointmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private AppointmentMapper appointmentMapper;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private UUID appointmentId;
    private UUID patientId;
    private UUID doctorId;
    private UUID hospitalId;
    private UUID slotId;
    private Appointment appointment;
    private AppointmentResponse appointmentResponse;
    private AppointmentRequest appointmentRequest;

    @BeforeEach
    void setUp() {
        appointmentId = UUID.randomUUID();
        patientId = UUID.randomUUID();
        doctorId = UUID.randomUUID();
        hospitalId = UUID.randomUUID();
        slotId = UUID.randomUUID();

        appointment = Appointment.builder()
                .id(appointmentId)
                .patientId(patientId)
                .doctorId(doctorId)
                .hospitalId(hospitalId)
                .slotId(slotId)
                .appointmentDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .status(AppointmentStatus.PENDING)
                .appointmentNumber("APP-20260814-1001")
                .reason("Checkup")
                .build();

        appointmentResponse = AppointmentResponse.builder()
                .id(appointmentId)
                .patientId(patientId)
                .doctorId(doctorId)
                .hospitalId(hospitalId)
                .slotId(slotId)
                .appointmentDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .status(AppointmentStatus.PENDING)
                .appointmentNumber("APP-20260814-1001")
                .reason("Checkup")
                .build();

        appointmentRequest = AppointmentRequest.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .hospitalId(hospitalId)
                .slotId(slotId)
                .appointmentDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .reason("Checkup")
                .build();
    }

    @Test
    @DisplayName("createAppointment - Successful creation")
    void createAppointment_success() {
        when(appointmentMapper.toEntity(any(AppointmentRequest.class))).thenReturn(appointment);
        when(appointmentRepository.existsByAppointmentNumber(any())).thenReturn(false);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        when(appointmentMapper.toDto(any(Appointment.class))).thenReturn(appointmentResponse);

        AppointmentResponse response = appointmentService.createAppointment(appointmentRequest);

        assertThat(response).isNotNull();
        assertThat(response.getAppointmentNumber()).isEqualTo("APP-20260814-1001");
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("createAppointment - Missing Patient ID throws BadRequestException")
    void createAppointment_nullPatientId_throwsBadRequest() {
        appointmentRequest.setPatientId(null);

        assertThatThrownBy(() -> appointmentService.createAppointment(appointmentRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Patient ID");
    }

    @Test
    @DisplayName("getAppointmentById - Success")
    void getAppointmentById_found() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentMapper.toDto(appointment)).thenReturn(appointmentResponse);

        AppointmentResponse response = appointmentService.getAppointmentById(appointmentId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(appointmentId);
    }

    @Test
    @DisplayName("getAppointmentById - Not found throws ResourceNotFoundException")
    void getAppointmentById_notFound_throwsResourceNotFound() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.getAppointmentById(appointmentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Appointment not found");
    }

    @Test
    @DisplayName("confirmAppointment - Successful confirmation")
    void confirmAppointment_success() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);
        when(appointmentMapper.toDto(appointment)).thenReturn(appointmentResponse);

        AppointmentResponse response = appointmentService.confirmAppointment(appointmentId);

        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
        verify(appointmentRepository).save(appointment);
    }

    @Test
    @DisplayName("confirmAppointment - Non-PENDING status throws InvalidAppointmentStateException")
    void confirmAppointment_invalidState_throwsException() {
        appointment.setStatus(AppointmentStatus.COMPLETED);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() -> appointmentService.confirmAppointment(appointmentId))
                .isInstanceOf(InvalidAppointmentStateException.class)
                .hasMessageContaining("Only PENDING appointments can be confirmed");
    }

    @Test
    @DisplayName("cancelAppointment - Successful cancellation")
    void cancelAppointment_success() {
        CancelAppointmentRequest cancelRequest = new CancelAppointmentRequest("Patient request");
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);
        when(appointmentMapper.toDto(appointment)).thenReturn(appointmentResponse);

        AppointmentResponse response = appointmentService.cancelAppointment(appointmentId, cancelRequest);

        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.CANCELLED);
        assertThat(appointment.getReason()).isEqualTo("Patient request");
        verify(appointmentRepository).save(appointment);
    }

    @Test
    @DisplayName("completeAppointment - Successful completion")
    void completeAppointment_success() {
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);
        when(appointmentMapper.toDto(appointment)).thenReturn(appointmentResponse);

        AppointmentResponse response = appointmentService.completeAppointment(appointmentId);

        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.COMPLETED);
        verify(appointmentRepository).save(appointment);
    }

    @Test
    @DisplayName("rescheduleAppointment - Successful rescheduling")
    void rescheduleAppointment_success() {
        UUID newSlotId = UUID.randomUUID();
        LocalDate newDate = LocalDate.now().plusDays(2);
        RescheduleAppointmentRequest request = RescheduleAppointmentRequest.builder()
                .newSlotId(newSlotId)
                .newAppointmentDate(newDate)
                .newStartTime(LocalTime.of(11, 0))
                .newEndTime(LocalTime.of(12, 0))
                .reason("Doctor unavailable")
                .build();

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);
        when(appointmentMapper.toDto(appointment)).thenReturn(appointmentResponse);

        AppointmentResponse response = appointmentService.rescheduleAppointment(appointmentId, request);

        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.RESCHEDULED);
        assertThat(appointment.getSlotId()).isEqualTo(newSlotId);
        assertThat(appointment.getAppointmentDate()).isEqualTo(newDate);
        verify(appointmentRepository).save(appointment);
    }

    @Test
    @DisplayName("deleteAppointment - Success")
    void deleteAppointment_success() {
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        appointmentService.deleteAppointment(appointmentId);

        verify(appointmentRepository).delete(appointment);
    }
}

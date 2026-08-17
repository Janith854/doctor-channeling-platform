package com.docplatform.schedule.service;

import com.docplatform.schedule.entity.AppointmentSlot;
import com.docplatform.schedule.entity.DayOfWeek;
import com.docplatform.schedule.entity.DoctorSchedule;
import com.docplatform.schedule.entity.SlotStatus;
import com.docplatform.schedule.exception.BadRequestException;
import com.docplatform.schedule.exception.ResourceNotFoundException;
import com.docplatform.schedule.repository.AppointmentSlotRepository;
import com.docplatform.schedule.repository.DoctorScheduleRepository;
import com.docplatform.schedule.service.impl.AppointmentSlotServiceImpl;
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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AppointmentSlotService Unit Tests")
class AppointmentSlotServiceTest {

    @Mock
    private AppointmentSlotRepository appointmentSlotRepository;

    @Mock
    private DoctorScheduleRepository doctorScheduleRepository;

    @InjectMocks
    private AppointmentSlotServiceImpl appointmentSlotService;

    private UUID scheduleId;
    private UUID doctorId;
    private UUID slotId;
    private LocalDate testDate;
    private DoctorSchedule activeSchedule;
    private AppointmentSlot appointmentSlot;

    @BeforeEach
    void setUp() {
        scheduleId = UUID.randomUUID();
        doctorId = UUID.randomUUID();
        slotId = UUID.randomUUID();
        testDate = LocalDate.of(2026, 8, 17); // A Monday

        activeSchedule = DoctorSchedule.builder()
                .id(scheduleId)
                .doctorId(doctorId)
                .hospitalId(UUID.randomUUID())
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .slotDurationMinutes(20)
                .active(true)
                .build();

        appointmentSlot = AppointmentSlot.builder()
                .id(slotId)
                .scheduleId(scheduleId)
                .doctorId(doctorId)
                .slotDate(testDate)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(9, 20))
                .status(SlotStatus.AVAILABLE)
                .build();
    }

    @Test
    @DisplayName("generateSlots - should successfully generate 3 slots for 1 hour duration with 20 min interval")
    void generateSlots_shouldGenerateSlotsSuccessfully() {
        when(doctorScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(activeSchedule));
        when(appointmentSlotRepository.existsByScheduleIdAndSlotDate(scheduleId, testDate)).thenReturn(false);
        when(appointmentSlotRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        List<AppointmentSlot> generated = appointmentSlotService.generateSlots(scheduleId, testDate);

        assertThat(generated).hasSize(3);
        assertThat(generated.get(0).getStartTime()).isEqualTo(LocalTime.of(9, 0));
        assertThat(generated.get(0).getEndTime()).isEqualTo(LocalTime.of(9, 20));
        assertThat(generated.get(1).getStartTime()).isEqualTo(LocalTime.of(9, 20));
        assertThat(generated.get(1).getEndTime()).isEqualTo(LocalTime.of(9, 40));
        assertThat(generated.get(2).getStartTime()).isEqualTo(LocalTime.of(9, 40));
        assertThat(generated.get(2).getEndTime()).isEqualTo(LocalTime.of(10, 0));
        verify(appointmentSlotRepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("generateSlots - should throw BadRequestException if schedule is inactive")
    void generateSlots_shouldThrow_whenScheduleIsInactive() {
        activeSchedule.setActive(false);
        when(doctorScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(activeSchedule));

        assertThatThrownBy(() -> appointmentSlotService.generateSlots(scheduleId, testDate))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot generate slots for an inactive schedule");

        verify(appointmentSlotRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("generateSlots - should throw BadRequestException if slots already generated")
    void generateSlots_shouldThrow_whenSlotsAlreadyExist() {
        when(doctorScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(activeSchedule));
        when(appointmentSlotRepository.existsByScheduleIdAndSlotDate(scheduleId, testDate)).thenReturn(true);

        assertThatThrownBy(() -> appointmentSlotService.generateSlots(scheduleId, testDate))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Slots already generated");

        verify(appointmentSlotRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("getSlotsByDoctorAndDate - should return slots")
    void getSlotsByDoctorAndDate_shouldReturnSlots() {
        when(appointmentSlotRepository.findByDoctorIdAndSlotDate(doctorId, testDate))
                .thenReturn(List.of(appointmentSlot));

        List<AppointmentSlot> result = appointmentSlotService.getSlotsByDoctorAndDate(doctorId, testDate);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDoctorId()).isEqualTo(doctorId);
    }

    @Test
    @DisplayName("getAvailableSlots - should return only available slots")
    void getAvailableSlots_shouldReturnAvailableSlots() {
        when(appointmentSlotRepository.findByDoctorIdAndSlotDateAndStatus(doctorId, testDate, SlotStatus.AVAILABLE))
                .thenReturn(List.of(appointmentSlot));

        List<AppointmentSlot> result = appointmentSlotService.getAvailableSlots(doctorId, testDate);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(SlotStatus.AVAILABLE);
    }

    @Test
    @DisplayName("getSlotById - should return slot when found")
    void getSlotById_shouldReturnSlot_whenFound() {
        when(appointmentSlotRepository.findById(slotId)).thenReturn(Optional.of(appointmentSlot));

        AppointmentSlot result = appointmentSlotService.getSlotById(slotId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(slotId);
    }

    @Test
    @DisplayName("getSlotById - should throw ResourceNotFoundException when not found")
    void getSlotById_shouldThrow_whenNotFound() {
        when(appointmentSlotRepository.findById(slotId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentSlotService.getSlotById(slotId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Appointment slot not found with id: " + slotId);
    }

    @Test
    @DisplayName("updateSlotStatus - should update slot status")
    void updateSlotStatus_shouldUpdateStatus() {
        when(appointmentSlotRepository.findById(slotId)).thenReturn(Optional.of(appointmentSlot));
        when(appointmentSlotRepository.save(any(AppointmentSlot.class))).thenAnswer(inv -> inv.getArgument(0));

        AppointmentSlot updated = appointmentSlotService.updateSlotStatus(slotId, SlotStatus.BOOKED);

        assertThat(updated.getStatus()).isEqualTo(SlotStatus.BOOKED);
        verify(appointmentSlotRepository, times(1)).save(appointmentSlot);
    }

    @Test
    @DisplayName("deleteSlot - should delete slot when exists")
    void deleteSlot_shouldDelete_whenExists() {
        when(appointmentSlotRepository.existsById(slotId)).thenReturn(true);
        doNothing().when(appointmentSlotRepository).deleteById(slotId);

        assertThatCode(() -> appointmentSlotService.deleteSlot(slotId))
                .doesNotThrowAnyException();

        verify(appointmentSlotRepository, times(1)).deleteById(slotId);
    }
}

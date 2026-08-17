package com.docplatform.schedule.service;

import com.docplatform.schedule.entity.DayOfWeek;
import com.docplatform.schedule.entity.DoctorSchedule;
import com.docplatform.schedule.exception.BadRequestException;
import com.docplatform.schedule.exception.ResourceNotFoundException;
import com.docplatform.schedule.repository.DoctorScheduleRepository;
import com.docplatform.schedule.service.impl.DoctorScheduleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DoctorScheduleService Unit Tests")
class DoctorScheduleServiceTest {

    @Mock
    private DoctorScheduleRepository doctorScheduleRepository;

    @InjectMocks
    private DoctorScheduleServiceImpl doctorScheduleService;

    private UUID scheduleId;
    private UUID doctorId;
    private UUID hospitalId;
    private DoctorSchedule schedule;

    @BeforeEach
    void setUp() {
        scheduleId = UUID.randomUUID();
        doctorId = UUID.randomUUID();
        hospitalId = UUID.randomUUID();

        schedule = DoctorSchedule.builder()
                .id(scheduleId)
                .doctorId(doctorId)
                .hospitalId(hospitalId)
                .dayOfWeek(DayOfWeek.MONDAY)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(17, 0))
                .slotDurationMinutes(20)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("createSchedule - should save and return schedule")
    void createSchedule_shouldSaveAndReturnSchedule() {
        when(doctorScheduleRepository.save(any(DoctorSchedule.class))).thenReturn(schedule);

        DoctorSchedule result = doctorScheduleService.createSchedule(schedule);

        assertThat(result).isNotNull();
        assertThat(result.getDoctorId()).isEqualTo(doctorId);
        verify(doctorScheduleRepository, times(1)).save(schedule);
    }

    @Test
    @DisplayName("createSchedule - should throw BadRequestException when end time is before start time")
    void createSchedule_shouldThrowBadRequestException_whenEndTimeBeforeStartTime() {
        schedule.setEndTime(LocalTime.of(8, 0)); // before startTime of 9:00

        assertThatThrownBy(() -> doctorScheduleService.createSchedule(schedule))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("End time must be after start time");

        verify(doctorScheduleRepository, never()).save(any());
    }

    @Test
    @DisplayName("getScheduleById - should return schedule when found")
    void getScheduleById_shouldReturnSchedule_whenFound() {
        when(doctorScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(schedule));

        DoctorSchedule result = doctorScheduleService.getScheduleById(scheduleId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(scheduleId);
    }

    @Test
    @DisplayName("getScheduleById - should throw ResourceNotFoundException when not found")
    void getScheduleById_shouldThrowResourceNotFoundException_whenNotFound() {
        when(doctorScheduleRepository.findById(scheduleId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> doctorScheduleService.getScheduleById(scheduleId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Schedule not found with id: " + scheduleId);
    }

    @Test
    @DisplayName("getAllSchedules - should return all schedules")
    void getAllSchedules_shouldReturnAllSchedules() {
        when(doctorScheduleRepository.findAll()).thenReturn(List.of(schedule));

        List<DoctorSchedule> result = doctorScheduleService.getAllSchedules();

        assertThat(result).hasSize(1);
        verify(doctorScheduleRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getSchedulesByDoctor - should return schedules for given doctor")
    void getSchedulesByDoctor_shouldReturnSchedules() {
        when(doctorScheduleRepository.findByDoctorId(doctorId)).thenReturn(List.of(schedule));

        List<DoctorSchedule> result = doctorScheduleService.getSchedulesByDoctor(doctorId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDoctorId()).isEqualTo(doctorId);
    }

    @Test
    @DisplayName("deleteSchedule - should delete schedule when it exists")
    void deleteSchedule_shouldDelete_whenExists() {
        when(doctorScheduleRepository.existsById(scheduleId)).thenReturn(true);
        doNothing().when(doctorScheduleRepository).deleteById(scheduleId);

        assertThatCode(() -> doctorScheduleService.deleteSchedule(scheduleId))
                .doesNotThrowAnyException();

        verify(doctorScheduleRepository, times(1)).deleteById(scheduleId);
    }

    @Test
    @DisplayName("deleteSchedule - should throw ResourceNotFoundException when not found")
    void deleteSchedule_shouldThrow_whenNotFound() {
        when(doctorScheduleRepository.existsById(scheduleId)).thenReturn(false);

        assertThatThrownBy(() -> doctorScheduleService.deleteSchedule(scheduleId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(doctorScheduleRepository, never()).deleteById(any());
    }

@Test
@DisplayName("activateSchedule - should set isActive to true")
void activateSchedule_shouldSetActive() {
    schedule.setActive(false);

    when(doctorScheduleRepository.findById(scheduleId))
            .thenReturn(Optional.of(schedule));

    when(doctorScheduleRepository.save(any(DoctorSchedule.class)))
            .thenAnswer(inv -> inv.getArgument(0));

    DoctorSchedule result = doctorScheduleService.activateSchedule(scheduleId);

    assertThat(result.isActive()).isTrue();
}

    @Test
    @DisplayName("deactivateSchedule - should set isActive to false")
    void deactivateSchedule_shouldSetInactive() {
        when(doctorScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(schedule));
        when(doctorScheduleRepository.save(any(DoctorSchedule.class))).thenAnswer(inv -> inv.getArgument(0));

        DoctorSchedule result = doctorScheduleService.deactivateSchedule(scheduleId);

        assertThat(result.isActive()).isFalse();
    }
}

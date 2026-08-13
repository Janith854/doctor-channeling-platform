package com.docplatform.schedule.service.impl;

import com.docplatform.schedule.entity.AppointmentSlot;
import com.docplatform.schedule.entity.DoctorSchedule;
import com.docplatform.schedule.entity.SlotStatus;
import com.docplatform.schedule.exception.BadRequestException;
import com.docplatform.schedule.exception.ResourceNotFoundException;
import com.docplatform.schedule.repository.AppointmentSlotRepository;
import com.docplatform.schedule.repository.DoctorScheduleRepository;
import com.docplatform.schedule.service.AppointmentSlotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AppointmentSlotServiceImpl implements AppointmentSlotService {

    private final AppointmentSlotRepository appointmentSlotRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;

    @Override
    @Transactional
    public List<AppointmentSlot> generateSlots(UUID scheduleId, LocalDate slotDate) {
        log.info("Generating slots for schedule: {} on date: {}", scheduleId, slotDate);

        DoctorSchedule schedule = doctorScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + scheduleId));

        if (!schedule.isActive()) {
            throw new BadRequestException("Cannot generate slots for an inactive schedule");
        }

        if (appointmentSlotRepository.existsByScheduleIdAndSlotDate(scheduleId, slotDate)) {
            throw new BadRequestException("Slots already generated for schedule " + scheduleId + " on date " + slotDate);
        }

        List<AppointmentSlot> slots = new ArrayList<>();
        LocalTime current = schedule.getStartTime();
        int durationMinutes = schedule.getSlotDurationMinutes();

        while (current.plusMinutes(durationMinutes).compareTo(schedule.getEndTime()) <= 0) {
            LocalTime slotEnd = current.plusMinutes(durationMinutes);
            AppointmentSlot slot = AppointmentSlot.builder()
                    .scheduleId(scheduleId)
                    .doctorId(schedule.getDoctorId())
                    .slotDate(slotDate)
                    .startTime(current)
                    .endTime(slotEnd)
                    .status(SlotStatus.AVAILABLE)
                    .build();
            slots.add(slot);
            current = slotEnd;
        }

        if (slots.isEmpty()) {
            throw new BadRequestException("No slots could be generated — check schedule times and slot duration");
        }

        List<AppointmentSlot> saved = appointmentSlotRepository.saveAll(slots);
        log.info("Generated {} slots for schedule {} on {}", saved.size(), scheduleId, slotDate);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentSlot> getSlotsByDoctorAndDate(UUID doctorId, LocalDate slotDate) {
        log.info("Fetching slots for doctor: {} on date: {}", doctorId, slotDate);
        return appointmentSlotRepository.findByDoctorIdAndSlotDate(doctorId, slotDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentSlot> getAvailableSlots(UUID doctorId, LocalDate slotDate) {
        log.info("Fetching available slots for doctor: {} on date: {}", doctorId, slotDate);
        return appointmentSlotRepository.findByDoctorIdAndSlotDateAndStatus(doctorId, slotDate, SlotStatus.AVAILABLE);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentSlot getSlotById(UUID id) {
        log.info("Fetching slot with ID: {}", id);
        return appointmentSlotRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Slot not found with ID: {}", id);
                    return new ResourceNotFoundException("Appointment slot not found with id: " + id);
                });
    }

    @Override
    @Transactional
    public AppointmentSlot updateSlotStatus(UUID id, SlotStatus status) {
        log.info("Updating slot {} status to {}", id, status);
        AppointmentSlot slot = getSlotById(id);
        slot.setStatus(status);
        AppointmentSlot saved = appointmentSlotRepository.save(slot);
        log.info("Slot {} status updated to {}", id, status);
        return saved;
    }

    @Override
    @Transactional
    public void deleteSlot(UUID id) {
        log.info("Deleting slot with ID: {}", id);
        if (!appointmentSlotRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment slot not found with id: " + id);
        }
        appointmentSlotRepository.deleteById(id);
        log.info("Slot {} deleted successfully", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentSlot> getSlotsByDoctor(UUID doctorId) {
        log.info("Fetching all slots for doctor: {}", doctorId);
        return appointmentSlotRepository.findByDoctorId(doctorId);
    }
}

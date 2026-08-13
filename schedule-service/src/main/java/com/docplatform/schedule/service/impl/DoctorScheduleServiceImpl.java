package com.docplatform.schedule.service.impl;

import com.docplatform.schedule.entity.DoctorSchedule;
import com.docplatform.schedule.exception.BadRequestException;
import com.docplatform.schedule.exception.ResourceNotFoundException;
import com.docplatform.schedule.repository.DoctorScheduleRepository;
import com.docplatform.schedule.service.DoctorScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    private final DoctorScheduleRepository doctorScheduleRepository;

    @Override
    @Transactional
    public DoctorSchedule createSchedule(DoctorSchedule schedule) {
        log.info("Creating schedule for doctor: {} on day: {}", schedule.getDoctorId(), schedule.getDayOfWeek());
        if (schedule.getEndTime().isBefore(schedule.getStartTime()) ||
                schedule.getEndTime().equals(schedule.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }
        try {
            DoctorSchedule saved = doctorScheduleRepository.save(schedule);
            log.info("Schedule created with ID: {}", saved.getId());
            return saved;
        } catch (Exception e) {
            log.error("Error creating schedule: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public DoctorSchedule updateSchedule(UUID id, DoctorSchedule schedule) {
        log.info("Updating schedule with ID: {}", id);
        DoctorSchedule existing = getScheduleById(id);

        if (schedule.getEndTime().isBefore(schedule.getStartTime()) ||
                schedule.getEndTime().equals(schedule.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        schedule.setId(existing.getId());
        schedule.setCreatedAt(existing.getCreatedAt());
        schedule.setActive(existing.isActive());

        try {
            DoctorSchedule updated = doctorScheduleRepository.save(schedule);
            log.info("Schedule updated with ID: {}", updated.getId());
            return updated;
        } catch (Exception e) {
            log.error("Error updating schedule with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorSchedule getScheduleById(UUID id) {
        log.info("Fetching schedule with ID: {}", id);
        return doctorScheduleRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Schedule not found with ID: {}", id);
                    return new ResourceNotFoundException("Schedule not found with id: " + id);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorSchedule> getAllSchedules() {
        log.info("Fetching all schedules");
        return doctorScheduleRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorSchedule> getSchedulesByDoctor(UUID doctorId) {
        log.info("Fetching schedules for doctor: {}", doctorId);
        return doctorScheduleRepository.findByDoctorId(doctorId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorSchedule> getSchedulesByHospital(UUID hospitalId) {
        log.info("Fetching schedules for hospital: {}", hospitalId);
        return doctorScheduleRepository.findByHospitalId(hospitalId);
    }

    @Override
    @Transactional
    public void deleteSchedule(UUID id) {
        log.info("Deleting schedule with ID: {}", id);
        if (!doctorScheduleRepository.existsById(id)) {
            log.warn("Schedule with ID {} does not exist, skipping deletion", id);
            throw new ResourceNotFoundException("Schedule not found with id: " + id);
        }
        doctorScheduleRepository.deleteById(id);
        log.info("Successfully deleted schedule with ID: {}", id);
    }

    @Override
    @Transactional
    public DoctorSchedule activateSchedule(UUID id) {
        log.info("Activating schedule with ID: {}", id);
        DoctorSchedule schedule = getScheduleById(id);
        schedule.setActive(true);
        DoctorSchedule saved = doctorScheduleRepository.save(schedule);
        log.info("Schedule with ID {} activated", id);
        return saved;
    }

    @Override
    @Transactional
    public DoctorSchedule deactivateSchedule(UUID id) {
        log.info("Deactivating schedule with ID: {}", id);
        DoctorSchedule schedule = getScheduleById(id);
        schedule.setActive(false);
        DoctorSchedule saved = doctorScheduleRepository.save(schedule);
        log.info("Schedule with ID {} deactivated", id);
        return saved;
    }
}

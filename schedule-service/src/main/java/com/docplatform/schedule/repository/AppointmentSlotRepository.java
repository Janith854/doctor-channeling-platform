package com.docplatform.schedule.repository;

import com.docplatform.schedule.entity.AppointmentSlot;
import com.docplatform.schedule.entity.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, UUID> {

    List<AppointmentSlot> findByDoctorId(UUID doctorId);

    List<AppointmentSlot> findByDoctorIdAndSlotDate(UUID doctorId, LocalDate slotDate);

    List<AppointmentSlot> findByStatus(SlotStatus status);

    List<AppointmentSlot> findByScheduleIdAndSlotDateAndStatus(UUID scheduleId, LocalDate slotDate, SlotStatus status);

    List<AppointmentSlot> findByDoctorIdAndSlotDateAndStatus(UUID doctorId, LocalDate slotDate, SlotStatus status);

    boolean existsByScheduleIdAndSlotDate(UUID scheduleId, LocalDate slotDate);
}

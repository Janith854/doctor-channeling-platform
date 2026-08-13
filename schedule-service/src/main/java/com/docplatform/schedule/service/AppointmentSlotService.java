package com.docplatform.schedule.service;

import com.docplatform.schedule.entity.AppointmentSlot;
import com.docplatform.schedule.entity.SlotStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AppointmentSlotService {

    List<AppointmentSlot> generateSlots(UUID scheduleId, LocalDate slotDate);

    List<AppointmentSlot> getSlotsByDoctorAndDate(UUID doctorId, LocalDate slotDate);

    List<AppointmentSlot> getAvailableSlots(UUID doctorId, LocalDate slotDate);

    AppointmentSlot getSlotById(UUID id);

    AppointmentSlot updateSlotStatus(UUID id, SlotStatus status);

    void deleteSlot(UUID id);

    List<AppointmentSlot> getSlotsByDoctor(UUID doctorId);
}

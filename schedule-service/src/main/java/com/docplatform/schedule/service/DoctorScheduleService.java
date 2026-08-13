package com.docplatform.schedule.service;

import com.docplatform.schedule.entity.DoctorSchedule;

import java.util.List;
import java.util.UUID;

public interface DoctorScheduleService {

    DoctorSchedule createSchedule(DoctorSchedule schedule);

    DoctorSchedule updateSchedule(UUID id, DoctorSchedule schedule);

    DoctorSchedule getScheduleById(UUID id);

    List<DoctorSchedule> getAllSchedules();

    List<DoctorSchedule> getSchedulesByDoctor(UUID doctorId);

    List<DoctorSchedule> getSchedulesByHospital(UUID hospitalId);

    void deleteSchedule(UUID id);

    DoctorSchedule activateSchedule(UUID id);

    DoctorSchedule deactivateSchedule(UUID id);
}

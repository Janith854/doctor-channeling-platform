package com.docplatform.schedule.repository;

import com.docplatform.schedule.entity.DayOfWeek;
import com.docplatform.schedule.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, UUID> {

    List<DoctorSchedule> findByDoctorId(UUID doctorId);

    List<DoctorSchedule> findByHospitalId(UUID hospitalId);

    List<DoctorSchedule> findByDoctorIdAndDayOfWeek(UUID doctorId, DayOfWeek dayOfWeek);

    boolean existsByDoctorId(UUID doctorId);

    List<DoctorSchedule> findByDoctorIdAndIsActive(UUID doctorId, boolean isActive);
}

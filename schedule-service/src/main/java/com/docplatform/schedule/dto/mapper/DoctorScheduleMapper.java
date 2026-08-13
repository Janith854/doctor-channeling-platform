package com.docplatform.schedule.dto.mapper;

import com.docplatform.schedule.dto.request.DoctorScheduleRequest;
import com.docplatform.schedule.dto.response.DoctorScheduleResponse;
import com.docplatform.schedule.entity.DoctorSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DoctorScheduleMapper {

    DoctorScheduleResponse toResponse(DoctorSchedule doctorSchedule);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    DoctorSchedule toEntity(DoctorScheduleRequest request);

    List<DoctorScheduleResponse> toResponseList(List<DoctorSchedule> schedules);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(DoctorScheduleRequest request, @MappingTarget DoctorSchedule doctorSchedule);
}

package com.docplatform.booking.mapper;

import com.docplatform.booking.domain.entity.Appointment;
import com.docplatform.booking.dto.request.AppointmentRequest;
import com.docplatform.booking.dto.response.AppointmentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    AppointmentResponse toDto(Appointment appointment);

    List<AppointmentResponse> toDtoList(List<Appointment> appointments);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "appointmentNumber", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Appointment toEntity(AppointmentRequest request);
}

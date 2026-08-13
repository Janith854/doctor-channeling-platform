package com.docplatform.schedule.dto.mapper;

import com.docplatform.schedule.dto.response.AppointmentSlotResponse;
import com.docplatform.schedule.entity.AppointmentSlot;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AppointmentSlotMapper {

    AppointmentSlotResponse toResponse(AppointmentSlot slot);

    List<AppointmentSlotResponse> toResponseList(List<AppointmentSlot> slots);
}

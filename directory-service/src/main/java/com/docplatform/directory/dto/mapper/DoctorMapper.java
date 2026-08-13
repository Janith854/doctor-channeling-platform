package com.docplatform.directory.dto.mapper;

import com.docplatform.directory.dto.request.DoctorRequest;
import com.docplatform.directory.dto.response.DoctorResponse;
import com.docplatform.directory.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {SpecializationMapper.class})
public interface DoctorMapper {

    DoctorResponse toResponse(Doctor doctor);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "affiliations", ignore = true)
    @Mapping(target = "specialization.id", source = "specializationId")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Doctor toEntity(DoctorRequest request);

    List<DoctorResponse> toResponseList(List<Doctor> doctors);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "affiliations", ignore = true)
    @Mapping(target = "specialization.id", source = "specializationId")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(DoctorRequest request, @MappingTarget Doctor doctor);
}

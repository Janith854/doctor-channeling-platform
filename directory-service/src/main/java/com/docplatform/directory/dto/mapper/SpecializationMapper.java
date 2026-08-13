package com.docplatform.directory.dto.mapper;

import com.docplatform.directory.dto.request.SpecializationRequest;
import com.docplatform.directory.dto.response.SpecializationResponse;
import com.docplatform.directory.entity.Specialization;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SpecializationMapper {

    SpecializationResponse toResponse(Specialization specialization);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctors", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Specialization toEntity(SpecializationRequest request);

    List<SpecializationResponse> toResponseList(List<Specialization> specializations);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctors", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(SpecializationRequest request, @MappingTarget Specialization specialization);
}

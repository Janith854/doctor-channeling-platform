package com.docplatform.directory.dto.mapper;

import com.docplatform.directory.dto.request.HospitalRequest;
import com.docplatform.directory.dto.response.HospitalResponse;
import com.docplatform.directory.entity.Hospital;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface HospitalMapper {

    HospitalResponse toResponse(Hospital hospital);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "affiliations", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Hospital toEntity(HospitalRequest request);

    List<HospitalResponse> toResponseList(List<Hospital> hospitals);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "affiliations", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(HospitalRequest request, @MappingTarget Hospital hospital);
}

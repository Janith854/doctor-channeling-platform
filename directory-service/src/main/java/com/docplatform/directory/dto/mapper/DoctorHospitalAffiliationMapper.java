package com.docplatform.directory.dto.mapper;

import com.docplatform.directory.dto.request.DoctorHospitalAffiliationRequest;
import com.docplatform.directory.dto.response.DoctorHospitalAffiliationResponse;
import com.docplatform.directory.entity.DoctorHospitalAffiliation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DoctorHospitalAffiliationMapper {

    @Mapping(target = "doctorId", source = "doctor.id")
    @Mapping(target = "hospitalId", source = "hospital.id")
    @Mapping(target = "doctorName", source = "doctor.fullName")
    @Mapping(target = "hospitalName", source = "hospital.name")
    DoctorHospitalAffiliationResponse toResponse(DoctorHospitalAffiliation affiliation);

    @Mapping(target = "id.doctorId", source = "doctorId")
    @Mapping(target = "id.hospitalId", source = "hospitalId")
    @Mapping(target = "doctor.id", source = "doctorId")
    @Mapping(target = "hospital.id", source = "hospitalId")
    DoctorHospitalAffiliation toEntity(DoctorHospitalAffiliationRequest request);

    List<DoctorHospitalAffiliationResponse> toResponseList(List<DoctorHospitalAffiliation> affiliations);
}

package com.docplatform.directory.controller;

import com.docplatform.directory.dto.mapper.DoctorHospitalAffiliationMapper;
import com.docplatform.directory.dto.request.DoctorHospitalAffiliationRequest;
import com.docplatform.directory.dto.response.DoctorHospitalAffiliationResponse;
import com.docplatform.directory.entity.DoctorHospitalAffiliation;
import com.docplatform.directory.entity.DoctorHospitalAffiliationId;
import com.docplatform.directory.service.DoctorHospitalAffiliationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DoctorHospitalAffiliationController.class)
class DoctorHospitalAffiliationControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DoctorHospitalAffiliationService affiliationService;

    @MockBean
    private DoctorHospitalAffiliationMapper affiliationMapper;

    private DoctorHospitalAffiliationRequest request;
    private DoctorHospitalAffiliationResponse response;
    private DoctorHospitalAffiliation entity;
    private DoctorHospitalAffiliationId id;

    @BeforeEach
    void setUp() {
        UUID docId = UUID.randomUUID();
        UUID hospId = UUID.randomUUID();
        id = new DoctorHospitalAffiliationId(docId, hospId);
        
        request = DoctorHospitalAffiliationRequest.builder()
                .doctorId(docId)
                .hospitalId(hospId)
                .build();
        entity = DoctorHospitalAffiliation.builder().id(id).build();
        response = DoctorHospitalAffiliationResponse.builder()
                .doctorId(docId)
                .hospitalId(hospId)
                .doctorName("Dr. Test")
                .hospitalName("Hospital Test")
                .build();
    }

    @Test
    void createAffiliation_Success() throws Exception {
        Mockito.when(affiliationMapper.toEntity(any(DoctorHospitalAffiliationRequest.class))).thenReturn(entity);
        Mockito.when(affiliationService.createAffiliation(any(DoctorHospitalAffiliation.class))).thenReturn(entity);
        Mockito.when(affiliationMapper.toResponse(any(DoctorHospitalAffiliation.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/affiliations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.doctorName").value("Dr. Test"));
    }

    @Test
    void getAffiliationById_Success() throws Exception {
        Mockito.when(affiliationService.getAffiliationById(id)).thenReturn(Optional.of(entity));
        Mockito.when(affiliationMapper.toResponse(entity)).thenReturn(response);

        mockMvc.perform(get("/api/v1/affiliations/doctor/{doctorId}/hospital/{hospitalId}", id.getDoctorId(), id.getHospitalId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.doctorName").value("Dr. Test"));
    }
}

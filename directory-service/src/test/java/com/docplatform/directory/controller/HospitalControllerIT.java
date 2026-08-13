package com.docplatform.directory.controller;

import com.docplatform.directory.dto.mapper.HospitalMapper;
import com.docplatform.directory.dto.request.HospitalRequest;
import com.docplatform.directory.dto.response.HospitalResponse;
import com.docplatform.directory.entity.Hospital;
import com.docplatform.directory.service.HospitalService;
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

@WebMvcTest(HospitalController.class)
class HospitalControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HospitalService hospitalService;

    @MockBean
    private HospitalMapper hospitalMapper;

    private HospitalRequest hospitalRequest;
    private HospitalResponse hospitalResponse;
    private Hospital hospital;
    private UUID hospitalId;

    @BeforeEach
    void setUp() {
        hospitalId = UUID.randomUUID();
        hospitalRequest = HospitalRequest.builder()
                .name("General Hospital")
                .build();

        hospital = Hospital.builder().id(hospitalId).name("General Hospital").build();
        hospitalResponse = HospitalResponse.builder().id(hospitalId).name("General Hospital").build();
    }

    @Test
    void createHospital_Success() throws Exception {
        Mockito.when(hospitalMapper.toEntity(any(HospitalRequest.class))).thenReturn(hospital);
        Mockito.when(hospitalService.createHospital(any(Hospital.class))).thenReturn(hospital);
        Mockito.when(hospitalMapper.toResponse(any(Hospital.class))).thenReturn(hospitalResponse);

        mockMvc.perform(post("/api/v1/hospitals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hospitalRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("General Hospital"));
    }

    @Test
    void getHospitalById_Success() throws Exception {
        Mockito.when(hospitalService.getHospitalById(hospitalId)).thenReturn(Optional.of(hospital));
        Mockito.when(hospitalMapper.toResponse(hospital)).thenReturn(hospitalResponse);

        mockMvc.perform(get("/api/v1/hospitals/{id}", hospitalId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("General Hospital"));
    }

    @Test
    void getAllHospitals_Success() throws Exception {
        Mockito.when(hospitalService.getAllHospitals()).thenReturn(List.of(hospital));
        Mockito.when(hospitalMapper.toResponseList(List.of(hospital))).thenReturn(List.of(hospitalResponse));

        mockMvc.perform(get("/api/v1/hospitals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("General Hospital"));
    }
}

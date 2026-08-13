package com.docplatform.directory.controller;

import com.docplatform.directory.dto.mapper.SpecializationMapper;
import com.docplatform.directory.dto.request.SpecializationRequest;
import com.docplatform.directory.dto.response.SpecializationResponse;
import com.docplatform.directory.entity.Specialization;
import com.docplatform.directory.service.SpecializationService;
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

@WebMvcTest(SpecializationController.class)
class SpecializationControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SpecializationService specializationService;

    @MockBean
    private SpecializationMapper specializationMapper;

    private SpecializationRequest request;
    private SpecializationResponse response;
    private Specialization entity;
    private UUID id;

    @BeforeEach
    void setUp() {
        id = UUID.randomUUID();
        request = SpecializationRequest.builder().name("Cardiology").build();
        entity = Specialization.builder().id(id).name("Cardiology").build();
        response = SpecializationResponse.builder().id(id).name("Cardiology").build();
    }

    @Test
    void createSpecialization_Success() throws Exception {
        Mockito.when(specializationMapper.toEntity(any(SpecializationRequest.class))).thenReturn(entity);
        Mockito.when(specializationService.createSpecialization(any(Specialization.class))).thenReturn(entity);
        Mockito.when(specializationMapper.toResponse(any(Specialization.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/specializations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Cardiology"));
    }

    @Test
    void getSpecializationById_Success() throws Exception {
        Mockito.when(specializationService.getSpecializationById(id)).thenReturn(Optional.of(entity));
        Mockito.when(specializationMapper.toResponse(entity)).thenReturn(response);

        mockMvc.perform(get("/api/v1/specializations/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Cardiology"));
    }
}

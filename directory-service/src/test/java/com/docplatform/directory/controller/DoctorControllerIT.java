package com.docplatform.directory.controller;

import com.docplatform.directory.dto.mapper.DoctorMapper;
import com.docplatform.directory.dto.request.DoctorRequest;
import com.docplatform.directory.dto.response.DoctorResponse;
import com.docplatform.directory.entity.Doctor;
import com.docplatform.directory.service.DoctorService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DoctorController.class)
class DoctorControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DoctorService doctorService;

    @MockBean
    private DoctorMapper doctorMapper;

    private DoctorRequest doctorRequest;
    private DoctorResponse doctorResponse;
    private Doctor doctor;
    private UUID doctorId;

    @BeforeEach
    void setUp() {
        doctorId = UUID.randomUUID();
        doctorRequest = DoctorRequest.builder()
                .userId(UUID.randomUUID())
                .fullName("Dr. House")
                .specializationId(UUID.randomUUID())
                .build();

        doctor = Doctor.builder().id(doctorId).fullName("Dr. House").build();
        doctorResponse = DoctorResponse.builder().id(doctorId).fullName("Dr. House").build();
    }

    @Test
    void createDoctor_Success() throws Exception {
        Mockito.when(doctorMapper.toEntity(any(DoctorRequest.class))).thenReturn(doctor);
        Mockito.when(doctorService.createDoctor(any(Doctor.class))).thenReturn(doctor);
        Mockito.when(doctorMapper.toResponse(any(Doctor.class))).thenReturn(doctorResponse);

        mockMvc.perform(post("/api/v1/doctors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(doctorRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Dr. House"));
    }

    @Test
    void getDoctorById_Success() throws Exception {
        Mockito.when(doctorService.getDoctorById(doctorId)).thenReturn(Optional.of(doctor));
        Mockito.when(doctorMapper.toResponse(doctor)).thenReturn(doctorResponse);

        mockMvc.perform(get("/api/v1/doctors/{id}", doctorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Dr. House"));
    }

    @Test
    void getAllDoctors_Success() throws Exception {
        Mockito.when(doctorService.getAllDoctors()).thenReturn(List.of(doctor));
        Mockito.when(doctorMapper.toResponseList(List.of(doctor))).thenReturn(List.of(doctorResponse));

        mockMvc.perform(get("/api/v1/doctors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].fullName").value("Dr. House"));
    }

    @Test
    void deleteDoctor_Success() throws Exception {
        Mockito.doNothing().when(doctorService).deleteDoctor(doctorId);

        mockMvc.perform(delete("/api/v1/doctors/{id}", doctorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}

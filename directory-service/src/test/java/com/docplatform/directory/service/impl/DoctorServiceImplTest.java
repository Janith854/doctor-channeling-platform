package com.docplatform.directory.service.impl;

import com.docplatform.directory.entity.Doctor;
import com.docplatform.directory.exception.ResourceNotFoundException;
import com.docplatform.directory.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceImplTest {

    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private DoctorServiceImpl doctorService;

    private Doctor doctor;
    private UUID doctorId;

    @BeforeEach
    void setUp() {
        doctorId = UUID.randomUUID();
        doctor = Doctor.builder()
                .id(doctorId)
                .userId(UUID.randomUUID())
                .fullName("Dr. John Doe")
                .qualifications("MBBS, MD")
                .build();
    }

    @Test
    void createDoctor_Success() {
        when(doctorRepository.save(any(Doctor.class))).thenReturn(doctor);

        Doctor created = doctorService.createDoctor(doctor);

        assertNotNull(created);
        assertEquals(doctor.getFullName(), created.getFullName());
        verify(doctorRepository, times(1)).save(any(Doctor.class));
    }

    @Test
    void updateDoctor_Success() {
        Doctor updatedDoctor = Doctor.builder()
                .id(doctorId)
                .userId(doctor.getUserId())
                .fullName("Dr. John Doe Updated")
                .build();

        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(doctorRepository.save(any(Doctor.class))).thenReturn(updatedDoctor);

        Doctor result = doctorService.updateDoctor(doctorId, updatedDoctor);

        assertNotNull(result);
        assertEquals("Dr. John Doe Updated", result.getFullName());
        verify(doctorRepository, times(1)).findById(doctorId);
        verify(doctorRepository, times(1)).save(any(Doctor.class));
    }

    @Test
    void updateDoctor_NotFound() {
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> doctorService.updateDoctor(doctorId, doctor));
        verify(doctorRepository, times(1)).findById(doctorId);
        verify(doctorRepository, never()).save(any(Doctor.class));
    }

    @Test
    void getDoctorById_Found() {
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));

        Optional<Doctor> result = doctorService.getDoctorById(doctorId);

        assertTrue(result.isPresent());
        assertEquals(doctorId, result.get().getId());
        verify(doctorRepository, times(1)).findById(doctorId);
    }

    @Test
    void getAllDoctors_Success() {
        when(doctorRepository.findAll()).thenReturn(List.of(doctor));

        List<Doctor> result = doctorService.getAllDoctors();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(doctorRepository, times(1)).findAll();
    }

    @Test
    void deleteDoctor_Success() {
        when(doctorRepository.existsById(doctorId)).thenReturn(true);
        doNothing().when(doctorRepository).deleteById(doctorId);

        assertDoesNotThrow(() -> doctorService.deleteDoctor(doctorId));
        verify(doctorRepository, times(1)).existsById(doctorId);
        verify(doctorRepository, times(1)).deleteById(doctorId);

    }
}

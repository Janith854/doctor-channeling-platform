package com.docplatform.directory.service.impl;

import com.docplatform.directory.entity.Hospital;
import com.docplatform.directory.exception.ResourceNotFoundException;
import com.docplatform.directory.repository.HospitalRepository;
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
class HospitalServiceImplTest {

    @Mock
    private HospitalRepository hospitalRepository;

    @InjectMocks
    private HospitalServiceImpl hospitalService;

    private Hospital hospital;
    private UUID hospitalId;

    @BeforeEach
    void setUp() {
        hospitalId = UUID.randomUUID();
        hospital = Hospital.builder()
                .id(hospitalId)
                .name("City General Hospital")
                .city("New York")
                .build();
    }

    @Test
    void createHospital_Success() {
        when(hospitalRepository.save(any(Hospital.class))).thenReturn(hospital);

        Hospital created = hospitalService.createHospital(hospital);

        assertNotNull(created);
        assertEquals(hospital.getName(), created.getName());
        verify(hospitalRepository, times(1)).save(any(Hospital.class));
    }

    @Test
    void updateHospital_Success() {
        Hospital updatedHospital = Hospital.builder()
                .id(hospitalId)
                .name("City General Hospital Updated")
                .build();

        when(hospitalRepository.findById(hospitalId)).thenReturn(Optional.of(hospital));
        when(hospitalRepository.save(any(Hospital.class))).thenReturn(updatedHospital);

        Hospital result = hospitalService.updateHospital(hospitalId, updatedHospital);

        assertNotNull(result);
        assertEquals("City General Hospital Updated", result.getName());
        verify(hospitalRepository, times(1)).findById(hospitalId);
        verify(hospitalRepository, times(1)).save(any(Hospital.class));
    }

    @Test
    void updateHospital_NotFound() {
        when(hospitalRepository.findById(hospitalId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> hospitalService.updateHospital(hospitalId, hospital));
        verify(hospitalRepository, times(1)).findById(hospitalId);
        verify(hospitalRepository, never()).save(any(Hospital.class));
    }

    @Test
    void getHospitalById_Found() {
        when(hospitalRepository.findById(hospitalId)).thenReturn(Optional.of(hospital));

        Optional<Hospital> result = hospitalService.getHospitalById(hospitalId);

        assertTrue(result.isPresent());
        assertEquals(hospitalId, result.get().getId());
        verify(hospitalRepository, times(1)).findById(hospitalId);
    }

    @Test
    void getAllHospitals_Success() {
        when(hospitalRepository.findAll()).thenReturn(List.of(hospital));

        List<Hospital> result = hospitalService.getAllHospitals();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(hospitalRepository, times(1)).findAll();
    }

    @Test
    void deleteHospital_Success() {
        when(hospitalRepository.existsById(hospitalId)).thenReturn(true);
        doNothing().when(hospitalRepository).deleteById(hospitalId);

        assertDoesNotThrow(() -> hospitalService.deleteHospital(hospitalId));
        verify(hospitalRepository, times(1)).existsById(hospitalId);
        verify(hospitalRepository, times(1)).deleteById(hospitalId);
    }
}

package com.docplatform.directory.service.impl;

import com.docplatform.directory.entity.Doctor;
import com.docplatform.directory.entity.DoctorHospitalAffiliation;
import com.docplatform.directory.entity.DoctorHospitalAffiliationId;
import com.docplatform.directory.entity.Hospital;
import com.docplatform.directory.exception.ResourceNotFoundException;
import com.docplatform.directory.repository.DoctorHospitalAffiliationRepository;
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
class DoctorHospitalAffiliationServiceImplTest {

    @Mock
    private DoctorHospitalAffiliationRepository affiliationRepository;

    @InjectMocks
    private DoctorHospitalAffiliationServiceImpl affiliationService;

    private DoctorHospitalAffiliation affiliation;
    private DoctorHospitalAffiliationId affiliationId;

    @BeforeEach
    void setUp() {
        UUID docId = UUID.randomUUID();
        UUID hospId = UUID.randomUUID();
        affiliationId = new DoctorHospitalAffiliationId(docId, hospId);
        
        Doctor doctor = Doctor.builder().id(docId).fullName("Dr. Test").build();
        Hospital hospital = Hospital.builder().id(hospId).name("Test Hospital").build();
        
        affiliation = DoctorHospitalAffiliation.builder()
                .id(affiliationId)
                .doctor(doctor)
                .hospital(hospital)
                .build();
    }

    @Test
    void createAffiliation_Success() {
        when(affiliationRepository.save(any(DoctorHospitalAffiliation.class))).thenReturn(affiliation);

        DoctorHospitalAffiliation created = affiliationService.createAffiliation(affiliation);

        assertNotNull(created);
        assertEquals(affiliationId, created.getId());
        verify(affiliationRepository, times(1)).save(any(DoctorHospitalAffiliation.class));
    }

    @Test
    void updateAffiliation_Success() {
        when(affiliationRepository.findById(affiliationId)).thenReturn(Optional.of(affiliation));
        when(affiliationRepository.save(any(DoctorHospitalAffiliation.class))).thenReturn(affiliation);

        DoctorHospitalAffiliation result = affiliationService.updateAffiliation(affiliationId, affiliation);

        assertNotNull(result);
        assertEquals(affiliationId, result.getId());
        verify(affiliationRepository, times(1)).findById(affiliationId);
        verify(affiliationRepository, times(1)).save(any(DoctorHospitalAffiliation.class));
    }

    @Test
    void updateAffiliation_NotFound() {
        when(affiliationRepository.findById(affiliationId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> affiliationService.updateAffiliation(affiliationId, affiliation));
        verify(affiliationRepository, times(1)).findById(affiliationId);
        verify(affiliationRepository, never()).save(any(DoctorHospitalAffiliation.class));
    }

    @Test
    void getAffiliationById_Found() {
        when(affiliationRepository.findById(affiliationId)).thenReturn(Optional.of(affiliation));

        Optional<DoctorHospitalAffiliation> result = affiliationService.getAffiliationById(affiliationId);

        assertTrue(result.isPresent());
        assertEquals(affiliationId, result.get().getId());
        verify(affiliationRepository, times(1)).findById(affiliationId);
    }

    @Test
    void getAllAffiliations_Success() {
        when(affiliationRepository.findAll()).thenReturn(List.of(affiliation));

        List<DoctorHospitalAffiliation> result = affiliationService.getAllAffiliations();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(affiliationRepository, times(1)).findAll();
    }

    @Test
    void deleteAffiliation_Success() {
        when(affiliationRepository.existsById(affiliationId)).thenReturn(true);
        doNothing().when(affiliationRepository).deleteById(affiliationId);

        assertDoesNotThrow(() -> affiliationService.deleteAffiliation(affiliationId));
        verify(affiliationRepository, times(1)).existsById(affiliationId);
        verify(affiliationRepository, times(1)).deleteById(affiliationId);
    }
}

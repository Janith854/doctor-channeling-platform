package com.docplatform.directory.service.impl;

import com.docplatform.directory.entity.Specialization;
import com.docplatform.directory.exception.ResourceNotFoundException;
import com.docplatform.directory.repository.SpecializationRepository;
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
class SpecializationServiceImplTest {

    @Mock
    private SpecializationRepository specializationRepository;

    @InjectMocks
    private SpecializationServiceImpl specializationService;

    private Specialization specialization;
    private UUID specId;

    @BeforeEach
    void setUp() {
        specId = UUID.randomUUID();
        specialization = Specialization.builder()
                .id(specId)
                .name("Cardiology")
                .build();
    }

    @Test
    void createSpecialization_Success() {
        when(specializationRepository.save(any(Specialization.class))).thenReturn(specialization);

        Specialization created = specializationService.createSpecialization(specialization);

        assertNotNull(created);
        assertEquals(specialization.getName(), created.getName());
        verify(specializationRepository, times(1)).save(any(Specialization.class));
    }

    @Test
    void updateSpecialization_Success() {
        Specialization updatedSpec = Specialization.builder()
                .id(specId)
                .name("Neurology")
                .build();

        when(specializationRepository.findById(specId)).thenReturn(Optional.of(specialization));
        when(specializationRepository.save(any(Specialization.class))).thenReturn(updatedSpec);

        Specialization result = specializationService.updateSpecialization(specId, updatedSpec);

        assertNotNull(result);
        assertEquals("Neurology", result.getName());
        verify(specializationRepository, times(1)).findById(specId);
        verify(specializationRepository, times(1)).save(any(Specialization.class));
    }

    @Test
    void updateSpecialization_NotFound() {
        when(specializationRepository.findById(specId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> specializationService.updateSpecialization(specId, specialization));
        verify(specializationRepository, times(1)).findById(specId);
        verify(specializationRepository, never()).save(any(Specialization.class));
    }

    @Test
    void getSpecializationById_Found() {
        when(specializationRepository.findById(specId)).thenReturn(Optional.of(specialization));

        Optional<Specialization> result = specializationService.getSpecializationById(specId);

        assertTrue(result.isPresent());
        assertEquals(specId, result.get().getId());
        verify(specializationRepository, times(1)).findById(specId);
    }

    @Test
    void getAllSpecializations_Success() {
        when(specializationRepository.findAll()).thenReturn(List.of(specialization));

        List<Specialization> result = specializationService.getAllSpecializations();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(specializationRepository, times(1)).findAll();
    }

    @Test
    void deleteSpecialization_Success() {
        when(specializationRepository.existsById(specId)).thenReturn(true);
        doNothing().when(specializationRepository).deleteById(specId);

        assertDoesNotThrow(() -> specializationService.deleteSpecialization(specId));
        verify(specializationRepository, times(1)).existsById(specId);
        verify(specializationRepository, times(1)).deleteById(specId);
    }
}

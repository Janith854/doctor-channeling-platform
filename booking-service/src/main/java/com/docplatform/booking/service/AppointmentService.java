package com.docplatform.booking.service;

import com.docplatform.booking.dto.request.AppointmentRequest;
import com.docplatform.booking.dto.request.CancelAppointmentRequest;
import com.docplatform.booking.dto.request.RescheduleAppointmentRequest;
import com.docplatform.booking.dto.response.AppointmentResponse;

import java.util.List;
import java.util.UUID;

public interface AppointmentService {

    AppointmentResponse createAppointment(AppointmentRequest request);

    AppointmentResponse getAppointmentById(UUID id);

    AppointmentResponse getByAppointmentNumber(String appointmentNumber);

    List<AppointmentResponse> getPatientAppointments(UUID patientId);

    List<AppointmentResponse> getDoctorAppointments(UUID doctorId);

    List<AppointmentResponse> getHospitalAppointments(UUID hospitalId);

    AppointmentResponse confirmAppointment(UUID id);

    AppointmentResponse cancelAppointment(UUID id, CancelAppointmentRequest request);

    AppointmentResponse completeAppointment(UUID id);

    AppointmentResponse markNoShow(UUID id);

    AppointmentResponse rescheduleAppointment(UUID id, RescheduleAppointmentRequest request);

    void deleteAppointment(UUID id);
}

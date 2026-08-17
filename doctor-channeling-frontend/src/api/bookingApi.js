import { bookingClient } from './axiosClient';

export const appointmentApi = {
  create: (data) => bookingClient.post('/api/v1/appointments', data),
  getById: (id) => bookingClient.get(`/api/v1/appointments/${id}`),
  getByNumber: (number) => bookingClient.get(`/api/v1/appointments/number/${number}`),
  getByPatient: (patientId) => bookingClient.get(`/api/v1/appointments/patient/${patientId}`),
  getByDoctor: (doctorId) => bookingClient.get(`/api/v1/appointments/doctor/${doctorId}`),
  getByHospital: (hospitalId) => bookingClient.get(`/api/v1/appointments/hospital/${hospitalId}`),
  confirm: (id) => bookingClient.patch(`/api/v1/appointments/${id}/confirm`),
  cancel: (id, data) => bookingClient.patch(`/api/v1/appointments/${id}/cancel`, data),
  complete: (id) => bookingClient.patch(`/api/v1/appointments/${id}/complete`),
  markNoShow: (id) => bookingClient.patch(`/api/v1/appointments/${id}/no-show`),
  reschedule: (id, data) => bookingClient.put(`/api/v1/appointments/${id}/reschedule`, data),
  delete: (id) => bookingClient.delete(`/api/v1/appointments/${id}`),
};

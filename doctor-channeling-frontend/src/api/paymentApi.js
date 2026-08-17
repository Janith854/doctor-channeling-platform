import { paymentClient } from './axiosClient';

export const paymentApi = {
  create: (data) => paymentClient.post('/api/v1/payments', data),
  getById: (id) => paymentClient.get(`/api/v1/payments/${id}`),
  getByAppointment: (appointmentId) =>
    paymentClient.get(`/api/v1/payments/appointment/${appointmentId}`),
  getByPatient: (patientId) =>
    paymentClient.get(`/api/v1/payments/patient/${patientId}`),
  refund: (id, data) => paymentClient.post(`/api/v1/payments/${id}/refund`, data),
  cancel: (id) => paymentClient.post(`/api/v1/payments/${id}/cancel`),
};

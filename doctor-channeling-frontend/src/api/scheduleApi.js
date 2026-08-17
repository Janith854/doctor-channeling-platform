import { scheduleClient } from './axiosClient';

export const scheduleApi = {
  getAll: () => scheduleClient.get('/api/v1/schedules'),
  getById: (id) => scheduleClient.get(`/api/v1/schedules/${id}`),
  getByDoctor: (doctorId) => scheduleClient.get(`/api/v1/schedules/doctor/${doctorId}`),
  getByHospital: (hospitalId) => scheduleClient.get(`/api/v1/schedules/hospital/${hospitalId}`),
  create: (data) => scheduleClient.post('/api/v1/schedules', data),
  update: (id, data) => scheduleClient.put(`/api/v1/schedules/${id}`, data),
  delete: (id) => scheduleClient.delete(`/api/v1/schedules/${id}`),
  activate: (id) => scheduleClient.patch(`/api/v1/schedules/${id}/activate`),
  deactivate: (id) => scheduleClient.patch(`/api/v1/schedules/${id}/deactivate`),
};

export const slotApi = {
  generate: (data) => scheduleClient.post('/api/v1/slots/generate', data),
  getById: (id) => scheduleClient.get(`/api/v1/slots/${id}`),
  getByDoctor: (doctorId) => scheduleClient.get(`/api/v1/slots/doctor/${doctorId}`),
  getByDoctorAndDate: (doctorId, date) =>
    scheduleClient.get(`/api/v1/slots/doctor/${doctorId}/date/${date}`),
  getAvailable: (doctorId, date) =>
    scheduleClient.get(`/api/v1/slots/available/${doctorId}/${date}`),
  updateStatus: (id, status) =>
    scheduleClient.patch(`/api/v1/slots/${id}/status`, { status }),
};

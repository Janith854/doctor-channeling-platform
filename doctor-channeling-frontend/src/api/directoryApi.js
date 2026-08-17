import { directoryClient } from './axiosClient';

export const doctorApi = {
  getAll: () => directoryClient.get('/api/v1/doctors'),
  getById: (id) => directoryClient.get(`/api/v1/doctors/${id}`),
  create: (data) => directoryClient.post('/api/v1/doctors', data),
  update: (id, data) => directoryClient.put(`/api/v1/doctors/${id}`, data),
  delete: (id) => directoryClient.delete(`/api/v1/doctors/${id}`),
};

export const hospitalApi = {
  getAll: () => directoryClient.get('/api/v1/hospitals'),
  getById: (id) => directoryClient.get(`/api/v1/hospitals/${id}`),
  create: (data) => directoryClient.post('/api/v1/hospitals', data),
  update: (id, data) => directoryClient.put(`/api/v1/hospitals/${id}`, data),
  delete: (id) => directoryClient.delete(`/api/v1/hospitals/${id}`),
};

export const specializationApi = {
  getAll: () => directoryClient.get('/api/v1/specializations'),
  getById: (id) => directoryClient.get(`/api/v1/specializations/${id}`),
  create: (data) => directoryClient.post('/api/v1/specializations', data),
  update: (id, data) => directoryClient.put(`/api/v1/specializations/${id}`, data),
  delete: (id) => directoryClient.delete(`/api/v1/specializations/${id}`),
};

export const affiliationApi = {
  getAll: () => directoryClient.get('/api/v1/affiliations'),
  getByHospital: (hospitalId) => directoryClient.get(`/api/v1/affiliations/hospital/${hospitalId}`),
  getByDoctorAndHospital: (doctorId, hospitalId) =>
    directoryClient.get(`/api/v1/affiliations/doctor/${doctorId}/hospital/${hospitalId}`),
  create: (data) => directoryClient.post('/api/v1/affiliations', data),
  update: (doctorId, hospitalId, data) =>
    directoryClient.put(`/api/v1/affiliations/doctor/${doctorId}/hospital/${hospitalId}`, data),
  delete: (doctorId, hospitalId) =>
    directoryClient.delete(`/api/v1/affiliations/doctor/${doctorId}/hospital/${hospitalId}`),
};

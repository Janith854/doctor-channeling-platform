import { notificationClient } from './axiosClient';

export const notificationApi = {
  create: (data) => notificationClient.post('/api/v1/notifications', data),
  getById: (id) => notificationClient.get(`/api/v1/notifications/${id}`),
  getByUser: (userId) => notificationClient.get(`/api/v1/notifications/user/${userId}`),
  markAsSent: (id) => notificationClient.patch(`/api/v1/notifications/${id}/sent`),
  markAsFailed: (id) => notificationClient.patch(`/api/v1/notifications/${id}/failed`),
  delete: (id) => notificationClient.delete(`/api/v1/notifications/${id}`),
  sendEmail: (data) => notificationClient.post('/api/v1/notifications/email', data),
};

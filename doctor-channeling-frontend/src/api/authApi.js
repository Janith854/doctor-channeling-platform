import { identityClient } from './axiosClient';

export const authApi = {
  register: (data) => identityClient.post('/api/v1/auth/register', data),
  login: (data) => identityClient.post('/api/v1/auth/login', data),
  refresh: (refreshToken) => identityClient.post('/api/v1/auth/refresh', { refreshToken }),
  logout: (refreshToken) => identityClient.post('/api/v1/auth/logout', { refreshToken }),
};

export const userApi = {
  getCurrentUser: () => identityClient.get('/api/v1/users/me'),
  getAllUsers: () => identityClient.get('/api/v1/users'),
  getUserById: (id) => identityClient.get(`/api/v1/users/${id}`),
  updateUser: (id, data) => identityClient.put(`/api/v1/users/${id}`, data),
  deleteUser: (id) => identityClient.delete(`/api/v1/users/${id}`),
};

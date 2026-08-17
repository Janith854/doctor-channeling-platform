import axios from 'axios';

const createClient = (baseURL) => {
  const client = axios.create({
    baseURL: baseURL || '',
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token');

          const identityBase = import.meta.env.VITE_IDENTITY_API || '';
          const res = await axios.post(
            `${identityBase}/api/v1/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { accessToken, refreshToken: newRefresh } = res.data?.data || res.data;
          localStorage.setItem('accessToken', accessToken);
          if (newRefresh) localStorage.setItem('refreshToken', newRefresh);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const identityClient = createClient(import.meta.env.VITE_IDENTITY_API || '');
export const directoryClient = createClient(import.meta.env.VITE_DIRECTORY_API || '');
export const scheduleClient = createClient(import.meta.env.VITE_SCHEDULE_API || '');
export const bookingClient = createClient(import.meta.env.VITE_BOOKING_API || '');
export const notificationClient = createClient(import.meta.env.VITE_NOTIFICATION_API || '');
export const paymentClient = createClient(import.meta.env.VITE_PAYMENT_API || '');

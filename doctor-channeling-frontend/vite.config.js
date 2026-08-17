import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    cors: true,
    proxy: {
      // Identity Service (8081)
      '/api/v1/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/users': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/roles': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },

      // Directory Service (8082)
      '/api/v1/doctors': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/hospitals': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/specializations': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/affiliations': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },

      // Schedule Service (8083)
      '/api/v1/schedules': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/slots': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
      },

      // Booking Service (8084)
      '/api/v1/appointments': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
      },

      // Notification Service (8085)
      '/api/v1/notifications': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
      },

      // Payment Service (8086)
      '/api/v1/payments': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Guards & Layouts
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorSearch from './pages/patient/DoctorSearch';
import DoctorProfile from './pages/patient/DoctorProfile';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/PatientAppointments';
import AppointmentDetails from './pages/patient/AppointmentDetails';
import PatientPayments from './pages/patient/PatientPayments';
import PatientNotifications from './pages/patient/PatientNotifications';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ScheduleManagement from './pages/doctor/ScheduleManagement';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorNotifications from './pages/doctor/DoctorNotifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminSpecializations from './pages/admin/AdminSpecializations';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminPayments from './pages/admin/AdminPayments';

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Patient Routes */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute>
                <RoleBasedRoute roles={['PATIENT', 'ROLE_PATIENT', 'ADMIN', 'ROLE_ADMIN']}>
                  <DashboardLayout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<PatientDashboard />} />
            <Route path="doctors" element={<DoctorSearch />} />
            <Route path="doctors/:id" element={<DoctorProfile />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="appointments/:id" element={<AppointmentDetails />} />
            <Route path="payments" element={<PatientPayments />} />
            <Route path="notifications" element={<PatientNotifications />} />
          </Route>

          {/* Doctor Routes */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute>
                <RoleBasedRoute roles={['DOCTOR', 'ROLE_DOCTOR', 'ADMIN', 'ROLE_ADMIN']}>
                  <DashboardLayout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<DoctorDashboard />} />
            <Route path="schedule" element={<ScheduleManagement />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="notifications" element={<DoctorNotifications />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleBasedRoute roles={['ADMIN', 'ROLE_ADMIN']}>
                  <DashboardLayout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="hospitals" element={<AdminHospitals />} />
            <Route path="specializations" element={<AdminSpecializations />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

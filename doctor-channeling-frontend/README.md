# Doctor Channeling Platform — Frontend Application

A production-grade, healthcare channeling single-page application built with **React**, **Vite**, **Tailwind CSS v4**, **React Router v6**, **React Hook Form**, and **Recharts**.

The application connects directly to six microservices:
- **Identity Service**: `http://localhost:8081` (Authentication, JWT Tokens, User Roles)
- **Directory Service**: `http://localhost:8082` (Doctors, Hospitals, Specializations, Affiliations)
- **Schedule Service**: `http://localhost:8083` (Doctor Schedules, Appointment Slots generation)
- **Booking Service**: `http://localhost:8084` (Patient Channeling Bookings, Status tracking)
- **Notification Service**: `http://localhost:8085` (Email & In-App Alerts, Notifications)
- **Payment Service**: `http://localhost:8086` (Stripe Payment Intents, Transactions, Refunds)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of `doctor-channeling-frontend/`:
```env
VITE_IDENTITY_API=http://localhost:8081
VITE_DIRECTORY_API=http://localhost:8082
VITE_SCHEDULE_API=http://localhost:8083
VITE_BOOKING_API=http://localhost:8084
VITE_NOTIFICATION_API=http://localhost:8085
VITE_PAYMENT_API=http://localhost:8086
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 3. Run Development Server
```bash
npm run dev
```
The app will run on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```

---

## 👥 User Roles & Access Control

| Role | Access URL | Permissions |
|------|-----------|-------------|
| **Patient** (`ROLE_PATIENT`) | `/patient` | Search doctors, view doctor profiles, book channeling slots, manage appointments, pay online, view notifications. |
| **Doctor** (`ROLE_DOCTOR`) | `/doctor` | Manage weekly clinic schedules, generate appointment slots, view daily consults, confirm/complete patient visits. |
| **Admin** (`ROLE_ADMIN`) | `/admin` | System overview KPI cards & trend charts, manage user accounts, doctors, hospitals, specializations, aggregate appointments & payments. |

---

## 🗺️ Route Directory

### Public Routes
- `/` — Landing page with featured specialists, specialty browser, and quick search.
- `/login` — JWT Authentication sign-in.
- `/register` — Account registration.

### Patient Routes (`/patient/*`)
- `/patient` — Patient Dashboard (welcome, next visit, quick stats, featured doctors).
- `/patient/doctors` — Doctor search & filter directory.
- `/patient/doctors/:id` — Doctor profile (qualifications, SLMC, weekly schedule).
- `/patient/book` — Multi-step appointment reservation & checkout.
- `/patient/appointments` — Appointment history & cancellation.
- `/patient/appointments/:id` — Channeling pass & detailed status.
- `/patient/payments` — Financial receipts & invoice history.
- `/patient/notifications` — In-app alerts & reminders.

### Doctor Routes (`/doctor/*`)
- `/doctor` — Doctor Dashboard (today's queue, consult metrics, schedule summary).
- `/doctor/schedule` — Weekly schedule templates & daily slot generation.
- `/doctor/appointments` — Consultation queue (Confirm, Complete, Mark No-Show).
- `/doctor/notifications` — Notification inbox.

### Admin Routes (`/admin/*`)
- `/admin` — Analytics Dashboard with KPI cards and Recharts graphs.
- `/admin/users` — User management (edit details, delete accounts).
- `/admin/doctors` — Directory practitioner management (add, edit, delete).
- `/admin/hospitals` — Hospital & clinic management.
- `/admin/specializations` — Medical specialties management.
- `/admin/appointments` — Platform-wide appointment monitoring.
- `/admin/payments` — Platform revenue monitoring & refund execution.

---

## 🎨 UI/UX Features
- **Tailwind CSS v4** Design System with custom medical cyan/teal palette.
- **Glassmorphism & Micro-animations** for smooth transitions and hover elevations.
- **Interactive Recharts** for appointment volume and revenue tracking.
- **Role-based route protection** (`ProtectedRoute` and `RoleBasedRoute`).
- **Axios Interceptors** with automatic JWT refresh token cycle.
- **Responsive Layout** supporting Desktop, Tablet, and Mobile views.

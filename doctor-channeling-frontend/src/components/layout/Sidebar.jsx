import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Bell,
  Calendar,
  Users,
  User,
  Stethoscope,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';

const patientLinks = [
  { to: '/patient', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/patient/doctors', icon: Search, label: 'Find Doctors' },
  { to: '/patient/book', icon: CalendarCheck, label: 'Book Appointment' },
  { to: '/patient/appointments', icon: ClipboardList, label: 'My Appointments' },
  { to: '/patient/payments', icon: CreditCard, label: 'Payments' },
  { to: '/patient/notifications', icon: Bell, label: 'Notifications' },
  { to: '/patient/profile', icon: User, label: 'My Profile' },
];

const doctorLinks = [
  { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/doctor/schedule', icon: Calendar, label: 'My Schedule' },
  { to: '/doctor/appointments', icon: ClipboardList, label: 'Appointments' },
  { to: '/doctor/patients', icon: Users, label: 'Patients' },
  { to: '/doctor/notifications', icon: Bell, label: 'Notifications' },
  { to: '/doctor/profile', icon: User, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/admin/patients', icon: Users, label: 'Patients' },
  { to: '/admin/appointments', icon: ClipboardList, label: 'Appointments' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const roleName = user?.role?.name || '';
  let links = patientLinks;
  let roleTitle = 'Patient Portal';

  if (roleName === 'ROLE_DOCTOR' || roleName === 'DOCTOR') {
    links = doctorLinks;
    roleTitle = 'Doctor Portal';
  } else if (roleName === 'ROLE_ADMIN' || roleName === 'ADMIN') {
    links = adminLinks;
    roleTitle = 'Admin Portal';
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-navy-100 flex flex-col transition-transform duration-200 ease-in-out',
          'lg:static lg:translate-x-0 lg:z-10 shrink-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Header in Drawer */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-navy-100 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-navy-900">
              Medi<span className="text-primary-600">Channel</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2.5">
              <p className="text-[11px] font-semibold text-navy-400 uppercase tracking-wider">
                {roleTitle}
              </p>
            </div>
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-semibold border-r-2 border-primary-600 shadow-xs'
                          : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                      )
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sub-footer profile banner */}
        <div className="p-3.5 border-t border-navy-100 bg-navy-50/50">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-xl bg-primary-600/10 text-primary-700 border border-primary-200/60 font-bold text-sm flex items-center justify-center shrink-0">
              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-navy-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-navy-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

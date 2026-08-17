import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  CreditCard,
  Bell,
  Calendar,
  Users,
  Stethoscope,
  Building2,
  Layers,
  ClipboardList,
  DollarSign,
} from 'lucide-react';

const patientLinks = [
  { to: '/patient', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/patient/doctors', icon: Search, label: 'Find Doctors' },
  { to: '/patient/book', icon: CalendarCheck, label: 'Book Appointment' },
  { to: '/patient/appointments', icon: ClipboardList, label: 'My Appointments' },
  { to: '/patient/payments', icon: CreditCard, label: 'Payments' },
  { to: '/patient/notifications', icon: Bell, label: 'Notifications' },
];

const doctorLinks = [
  { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/doctor/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/doctor/appointments', icon: ClipboardList, label: 'Appointments' },
  { to: '/doctor/notifications', icon: Bell, label: 'Notifications' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/admin/hospitals', icon: Building2, label: 'Hospitals' },
  { to: '/admin/specializations', icon: Layers, label: 'Specializations' },
  { to: '/admin/appointments', icon: ClipboardList, label: 'Appointments' },
  { to: '/admin/payments', icon: DollarSign, label: 'Payments' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const roleName = user?.role?.name || '';
  let links = patientLinks;
  if (roleName === 'ROLE_DOCTOR') links = doctorLinks;
  if (roleName === 'ROLE_ADMIN') links = adminLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-navy-100 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-navy-100 lg:hidden">
          <span className="text-lg font-bold text-navy-900">
            Medi<span className="text-primary-600">Channel</span>
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-navy-100 cursor-pointer"
          >
            <X className="w-5 h-5 text-navy-600" />
          </button>
        </div>

        <nav className="p-3 space-y-1 mt-2 lg:mt-0">
          <div className="px-3 mb-4">
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
              {roleName.replace('ROLE_', '')} Menu
            </p>
          </div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-navy-500 hover:bg-navy-50 hover:text-navy-700'
                )
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

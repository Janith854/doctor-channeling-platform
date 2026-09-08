import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import {
  Menu,
  LogOut,
  User,
  ChevronDown,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

const routeTitleMap = {
  '/patient': 'Dashboard',
  '/patient/doctors': 'Find Doctors',
  '/patient/book': 'Book Appointment',
  '/patient/appointments': 'My Appointments',
  '/patient/payments': 'Payment History',
  '/patient/notifications': 'Notifications',
  '/doctor': 'Doctor Dashboard',
  '/doctor/schedule': 'My Schedule',
  '/doctor/appointments': 'Appointments',
  '/doctor/patients': 'Patient Consultations',
  '/doctor/notifications': 'Notifications',
  '/doctor/profile': 'Doctor Profile',
  '/admin': 'Admin Control Center',
  '/admin/users': 'User Management',
  '/admin/patients': 'Patients Directory',
  '/admin/doctors': 'Doctors Directory',
  '/admin/hospitals': 'Hospitals Directory',
  '/admin/specializations': 'Medical Specialties',
  '/admin/appointments': 'Appointments Management',
  '/admin/payments': 'Payments Oversight',
  '/admin/reports': 'System Reports',
  '/admin/settings': 'Settings',
};

export default function Navbar({ onMenuClick }) {
  const { user, logout, getRolePath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleRaw = user?.role?.name || '';
  const roleLabel = roleRaw.replace('ROLE_', '');
  const currentTitle =
    routeTitleMap[location.pathname] ||
    (location.pathname.startsWith('/patient/doctors/')
      ? 'Doctor Profile'
      : location.pathname.startsWith('/patient/appointments/')
      ? 'Appointment Details'
      : 'MediChannel');

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-navy-100 shadow-2xs">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section: Mobile Menu + Brand + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-navy-600 hover:bg-navy-50 hover:text-navy-900 transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to={getRolePath()} className="flex items-center gap-2.5 mr-2">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-navy-900 hidden sm:inline-block">
              Medi<span className="text-primary-600">Channel</span>
            </span>
          </Link>

          {/* Breadcrumb / Page Title for desktop */}
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-navy-100 text-xs text-navy-400">
            <span className="capitalize">{roleLabel.toLowerCase()}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-navy-800">{currentTitle}</span>
          </div>
        </div>

        {/* Right Section: Notifications + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell />

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-navy-50 transition-colors cursor-pointer border border-transparent hover:border-navy-100"
              aria-expanded={showProfile}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-navy-900 leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] font-medium text-primary-700">
                  {roleLabel}
                </p>
              </div>

              <div className="w-8 h-8 rounded-xl bg-primary-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-navy-400 hidden sm:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-navy-100 py-1.5 animate-scale-in z-50">
                <div className="px-4 py-2.5 border-b border-navy-100">
                  <p className="text-xs font-bold text-navy-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] text-navy-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                    {roleLabel}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to={getRolePath()}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-navy-700 hover:bg-navy-50 transition-colors"
                    onClick={() => setShowProfile(false)}
                  >
                    <User className="w-4 h-4 text-navy-400" />
                    Dashboard Overview
                  </Link>
                </div>

                <div className="pt-1 border-t border-navy-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-danger-600 hover:bg-danger-50 transition-colors w-full cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

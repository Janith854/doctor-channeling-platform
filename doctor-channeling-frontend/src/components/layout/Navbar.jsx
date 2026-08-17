import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import {
  Menu,
  LogOut,
  User,
  ChevronDown,
  Stethoscope,
} from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user, logout, getRolePath } = useAuth();
  const navigate = useNavigate();
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

  const roleName = user?.role?.name || '';
  const roleLabel = roleName.replace('ROLE_', '');

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-navy-100">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-navy-100 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 text-navy-600" />
          </button>
          <Link to={getRolePath()} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-navy-900 hidden sm:block">
              Medi<span className="text-primary-600">Channel</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 pl-3 rounded-xl hover:bg-navy-50 transition-colors cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-navy-800 leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-navy-400">{roleLabel}</p>
              </div>
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <ChevronDown className="w-4 h-4 text-navy-400 hidden sm:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-navy-100 py-2 animate-slide-down">
                <div className="px-4 py-2 border-b border-navy-100">
                  <p className="text-sm font-semibold text-navy-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-navy-400">{user?.email}</p>
                </div>
                <Link
                  to={getRolePath()}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy-600 hover:bg-navy-50 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors w-full cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

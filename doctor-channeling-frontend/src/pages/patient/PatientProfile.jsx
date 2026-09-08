import { useAuth } from '../../context/AuthContext';
import { User, Mail, ShieldCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ProfileField({ label, value, mono = false }) {
  if (!value) return null;
  return (
    <div className="py-3 border-b border-navy-100 last:border-0">
      <p className="text-[11px] font-bold text-navy-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className={`text-sm font-semibold text-navy-900 ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-navy-100 rounded-2xl shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-100 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-sm font-bold text-navy-900">{title}</h2>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

export default function PatientProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Patient';
  const initials =
    (firstName[0] || '') + (lastName[0] || '') || fullName[0]?.toUpperCase() || 'P';

  const roleName = user?.role?.name || user?.role || '';
  const displayRole = roleName.replace('ROLE_', '');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">My Profile</h1>
        <p className="text-sm text-navy-500 mt-1">Your personal and account information</p>
      </div>

      {/* Avatar Card */}
      <div className="bg-white border border-navy-100 rounded-2xl shadow-xs p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-2xl font-bold shrink-0 shadow-sm">
          {initials}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-navy-900">{fullName}</h2>
          <p className="text-sm text-navy-500 mt-0.5">{user?.email}</p>
          <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            {displayRole || 'Patient'}
          </span>
        </div>

        {/* Logout button */}
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="sm:ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-navy-200 bg-white text-navy-600 hover:border-danger-300 hover:text-danger-600 text-sm font-semibold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Personal Information */}
      <SectionCard title="Personal Information" icon={User}>
        <ProfileField label="First Name" value={user?.firstName} />
        <ProfileField label="Last Name" value={user?.lastName} />
        <ProfileField
          label="Date of Birth"
          value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : null}
        />
        <ProfileField label="Gender" value={user?.gender} />
      </SectionCard>

      {/* Contact Information */}
      <SectionCard title="Contact Information" icon={Mail}>
        <ProfileField label="Email Address" value={user?.email} />
        <ProfileField label="Phone Number" value={user?.phone || user?.phoneNumber || user?.mobile} />
        <ProfileField label="Address" value={user?.address} />
      </SectionCard>

      {/* Account Information */}
      <SectionCard title="Account Information" icon={ShieldCheck}>
        <ProfileField label="User ID" value={user?.id} mono />
        <ProfileField label="Account Role" value={displayRole || 'Patient'} />
        <ProfileField
          label="Account Created"
          value={
            user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : null
          }
        />
      </SectionCard>
    </div>
  );
}

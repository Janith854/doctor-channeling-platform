import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/bookingApi';
import StatusBadge from '../../components/appointments/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ClipboardList, Plus, Calendar, Clock, ChevronRight, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

function AppointmentListCard({ appointment, onCancel }) {
  const isPending = appointment.status === 'PENDING' || appointment.status === 'CONFIRMED';
  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-4 sm:p-5 hover:border-navy-200 transition-all shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <StatusBadge status={appointment.status} />
            <span className="text-xs font-semibold text-navy-400 truncate">
              #{appointment.appointmentNumber || appointment.id?.slice(0, 8)}
            </span>
          </div>
          <p className="text-sm font-bold text-navy-900 truncate">
            Doctor #{appointment.doctorId?.slice(0, 8)}
          </p>
        </div>
        <Link
          to={`/patient/appointments/${appointment.id}`}
          id={`btn-details-${appointment.id}`}
          className="shrink-0"
        >
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-50 hover:bg-navy-100 text-navy-700 text-xs font-semibold transition-all cursor-pointer">
            Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-navy-600">
        <span className="flex items-center gap-1.5 bg-navy-50 px-2.5 py-1 rounded-lg font-medium">
          <Calendar className="w-3.5 h-3.5 text-primary-600" />
          {appointment.appointmentDate}
        </span>
        <span className="flex items-center gap-1.5 bg-navy-50 px-2.5 py-1 rounded-lg font-medium">
          <Clock className="w-3.5 h-3.5 text-primary-600" />
          {appointment.startTime?.slice(0, 5)}
        </span>
      </div>

      {isPending && (
        <div className="mt-3 pt-3 border-t border-navy-100 flex justify-end">
          <button
            onClick={() => onCancel(appointment.id)}
            id={`btn-cancel-${appointment.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-danger-600 hover:text-danger-700 cursor-pointer"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await appointmentApi.getByPatient(user.id);
      setAppointments(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user?.id]);

  const handleOpenCancel = (id) => {
    setSelectedApptId(id);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedApptId) return;
    try {
      setCancelling(true);
      await appointmentApi.cancel(selectedApptId, { reason: 'Cancelled by patient' });
      toast.success('Appointment cancelled successfully');
      setCancelModalOpen(false);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const filtered = appointments.filter((a) => {
    if (activeTab === 'UPCOMING') return a.status === 'PENDING' || a.status === 'CONFIRMED';
    if (activeTab === 'COMPLETED') return a.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  const counts = {
    UPCOMING: appointments.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED').length,
    COMPLETED: appointments.filter((a) => a.status === 'COMPLETED').length,
    CANCELLED: appointments.filter((a) => a.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Appointments</h1>
          <p className="text-sm text-navy-500 mt-1">
            Manage and track your doctor consultations
          </p>
        </div>
        <Link to="/patient/book">
          <button
            id="btn-book-new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white border border-navy-100 rounded-xl w-fit shadow-xs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key.toLowerCase()}`}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-navy-100 text-navy-600'
                }`}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <Loader text="Loading appointments..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={`No ${activeTab.toLowerCase()} appointments`}
          description={
            activeTab === 'UPCOMING'
              ? "You don't have any upcoming appointments. Book a consultation to get started."
              : `You don't have any ${activeTab.toLowerCase()} appointments.`
          }
          actionLabel={activeTab === 'UPCOMING' ? 'Book Appointment' : undefined}
          onAction={activeTab === 'UPCOMING' ? () => (window.location.href = '/patient/book') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((appt) => (
            <AppointmentListCard
              key={appt.id}
              appointment={appt}
              onCancel={handleOpenCancel}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel"
      />
    </div>
  );
}

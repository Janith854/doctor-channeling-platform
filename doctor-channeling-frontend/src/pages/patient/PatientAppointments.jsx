import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/bookingApi';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ClipboardList, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
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
    if (filter === 'UPCOMING') return a.status === 'PENDING' || a.status === 'CONFIRMED';
    if (filter === 'COMPLETED') return a.status === 'COMPLETED';
    if (filter === 'CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">My Appointments</h1>
          <p className="text-sm text-navy-500 mt-1">Manage and track your doctor appointments</p>
        </div>
        <Link to="/patient/book">
          <Button variant="primary" size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> Book New Appointment
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white rounded-2xl border border-navy-100 w-fit">
        {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === tab
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-navy-600 hover:bg-navy-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader text="Loading your appointments..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No appointments found"
          description={filter === 'ALL' ? "You haven't scheduled any doctor appointments yet." : `No ${filter.toLowerCase()} appointments.`}
          actionLabel="Book an Appointment"
          onAction={() => window.location.href = '/patient/book'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              role="PATIENT"
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
        message="Are you sure you want to cancel this appointment? This action cannot be reversed."
        confirmText="Yes, Cancel Appointment"
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/bookingApi';
import { doctorApi } from '../../api/directoryApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/appointments/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  UserX,
  Clock,
  Calendar,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // Confirmation actions
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: '',
    appointmentId: null,
    title: '',
    message: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const docListRes = await doctorApi.getAll();
      const allDocs = docListRes.data?.data || [];
      const currentDoc = allDocs.find((d) => d.userId === user.id) || allDocs[0];
      const docId = currentDoc?.id || user.id;

      const res = await appointmentApi.getByDoctor(docId);
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

  const handleAction = async () => {
    const { type, appointmentId } = confirmDialog;
    if (!appointmentId) return;

    try {
      setActionLoading(true);
      if (type === 'CONFIRM') await appointmentApi.confirm(appointmentId);
      if (type === 'COMPLETE') await appointmentApi.complete(appointmentId);
      if (type === 'NO_SHOW') await appointmentApi.markNoShow(appointmentId);
      if (type === 'CANCEL') await appointmentApi.cancel(appointmentId, { reason: 'Doctor cancelled' });

      toast.success(`Appointment status updated successfully`);
      setConfirmDialog({ isOpen: false, type: '', appointmentId: null, title: '', message: '' });
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = appointments.filter((a) => {
    if (filter === 'PENDING') return a.status === 'PENDING';
    if (filter === 'CONFIRMED') return a.status === 'CONFIRMED';
    if (filter === 'COMPLETED') return a.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Doctor Channeling Appointments</h1>
          <p className="text-sm text-navy-500 mt-1">Review scheduled patient consultations, confirm, and update progress</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white rounded-2xl border border-navy-100 w-fit">
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED'].map((tab) => (
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
        <Loader text="Loading appointments..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No appointments match this filter"
          description="You don't have any appointments in this status category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((appt) => (
            <Card key={appt.id} className="bg-white border border-navy-100 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-navy-100">
                  <span className="text-xs font-bold text-navy-400">
                    Appt #{appt.appointmentNumber || appt.id?.slice(0, 8)}
                  </span>
                  <StatusBadge status={appt.status} />
                </div>

                <div className="space-y-1.5 text-xs text-navy-700">
                  <div className="flex items-center gap-2 font-semibold">
                    <User className="w-4 h-4 text-primary-500" />
                    <span>Patient ID: {appt.patientId?.slice(0, 8)}</span>
                  </div>

                  <div className="flex items-center gap-4 bg-navy-50 p-2.5 rounded-xl font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      <span>{appt.appointmentDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span>{appt.startTime?.slice(0, 5)}</span>
                    </div>
                  </div>

                  {appt.reason && <p className="italic text-navy-500 pt-1">"{appt.reason}"</p>}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-navy-100 flex flex-wrap gap-2">
                {appt.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() =>
                      setConfirmDialog({
                        isOpen: true,
                        type: 'CONFIRM',
                        appointmentId: appt.id,
                        title: 'Confirm Appointment',
                        message: 'Confirm this appointment for the patient?',
                      })
                    }
                  >
                    Confirm
                  </Button>
                )}

                {appt.status === 'CONFIRMED' && (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="accent"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          type: 'COMPLETE',
                          appointmentId: appt.id,
                          title: 'Complete Consultation',
                          message: 'Mark this patient consultation as successfully completed?',
                        })
                      }
                    >
                      Complete
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          type: 'NO_SHOW',
                          appointmentId: appt.id,
                          title: 'Mark No-Show',
                          message: 'Mark patient as not showed up?',
                        })
                      }
                    >
                      No Show
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleAction}
        loading={actionLoading}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Confirm Action"
      />
    </div>
  );
}

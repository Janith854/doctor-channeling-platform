import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/bookingApi';
import { doctorApi } from '../../api/directoryApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/appointments/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  ClipboardList,
  Clock,
  Calendar,
  User,
  Search,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TODAY');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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
      const docListRes = await doctorApi.getAll().catch(() => ({ data: { data: [] } }));
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

      toast.success('Consultation updated successfully');
      setConfirmDialog({ isOpen: false, type: '', appointmentId: null, title: '', message: '' });
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update consultation status');
    } finally {
      setActionLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Tab Filtering
  const filtered = appointments.filter((a) => {
    // Tab filter
    if (activeTab === 'TODAY') {
      if (a.appointmentDate !== todayStr) return false;
    } else if (activeTab === 'UPCOMING') {
      if (a.appointmentDate <= todayStr || a.status === 'CANCELLED' || a.status === 'COMPLETED')
        return false;
    } else if (activeTab === 'COMPLETED') {
      if (a.status !== 'COMPLETED') return false;
    } else if (activeTab === 'CANCELLED') {
      if (a.status !== 'CANCELLED' && a.status !== 'NO_SHOW') return false;
    }

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const numMatch = a.appointmentNumber?.toLowerCase().includes(q);
      const idMatch = a.patientId?.toLowerCase().includes(q) || a.id?.toLowerCase().includes(q);
      const reasonMatch = a.reason?.toLowerCase().includes(q);
      if (!numMatch && !idMatch && !reasonMatch) return false;
    }

    // Specific Date filter
    if (dateFilter && a.appointmentDate !== dateFilter) {
      return false;
    }

    return true;
  });

  const tabCounts = {
    TODAY: appointments.filter((a) => a.appointmentDate === todayStr).length,
    UPCOMING: appointments.filter(
      (a) => a.appointmentDate > todayStr && a.status !== 'CANCELLED' && a.status !== 'COMPLETED'
    ).length,
    COMPLETED: appointments.filter((a) => a.status === 'COMPLETED').length,
    CANCELLED: appointments.filter((a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation Appointments"
        subtitle="Manage patient appointments, verify arrival, and record consultation outcomes"
      />

      {/* Tabs Row with Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { key: 'TODAY', label: 'Today', count: tabCounts.TODAY },
            { key: 'UPCOMING', label: 'Upcoming', count: tabCounts.UPCOMING },
            { key: 'COMPLETED', label: 'Completed', count: tabCounts.COMPLETED },
            { key: 'CANCELLED', label: 'Cancelled / No-Show', count: tabCounts.CANCELLED },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white text-navy-600 hover:bg-navy-50 hover:text-navy-900 border border-navy-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-navy-100 text-navy-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Date Filter Inputs */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Search patient, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-navy-900 placeholder:text-navy-400"
            />
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-navy-700"
          />

          {(searchTerm || dateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
              }}
              className="text-xs text-navy-500 hover:text-navy-800"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <Loader text="Loading consultations list..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No appointments found"
          description="There are currently no patient consultations matching this filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((appt) => (
            <Card
              key={appt.id}
              className="bg-white border border-navy-100 p-5 flex flex-col justify-between hover:border-navy-200 transition-all shadow-2xs"
            >
              <div className="space-y-3.5">
                <div className="flex justify-between items-center pb-2.5 border-b border-navy-100">
                  <span className="font-mono text-xs font-bold text-navy-400">
                    #{appt.appointmentNumber || appt.id?.slice(0, 8)}
                  </span>
                  <StatusBadge status={appt.status} />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 border border-primary-100 flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-navy-900 text-sm truncate">
                        Patient #{appt.patientId?.slice(0, 8)}
                      </p>
                      <p className="text-[11px] text-navy-400">Ref: {appt.id?.slice(0, 12)}</p>
                    </div>
                  </div>

                  <div className="bg-navy-50/70 p-3 rounded-xl border border-navy-100/60 space-y-1.5 text-xs text-navy-700">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-navy-500">
                        <Calendar className="w-3.5 h-3.5 text-primary-600" /> Date
                      </span>
                      <span className="font-semibold text-navy-900">{appt.appointmentDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-navy-500">
                        <Clock className="w-3.5 h-3.5 text-primary-600" /> Time Slot
                      </span>
                      <span className="font-semibold text-navy-900">
                        {appt.startTime?.slice(0, 5)} - {appt.endTime?.slice(0, 5)}
                      </span>
                    </div>
                  </div>

                  {appt.reason && (
                    <p className="text-xs text-navy-600 bg-white p-2.5 rounded-xl border border-navy-100 line-clamp-2">
                      <span className="font-medium text-navy-900">Chief complaint: </span>
                      {appt.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-3.5 mt-4 border-t border-navy-100">
                {appt.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          type: 'CONFIRM',
                          appointmentId: appt.id,
                          title: 'Confirm Appointment',
                          message: `Confirm consultation appointment #${appt.appointmentNumber || appt.id?.slice(0, 6)}?`,
                        })
                      }
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs text-danger-600 hover:bg-danger-50"
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          type: 'CANCEL',
                          appointmentId: appt.id,
                          title: 'Cancel Appointment',
                          message: 'Are you sure you want to cancel this appointment?',
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {appt.status === 'CONFIRMED' && (
                  <div className="flex gap-2">
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
                      Mark Complete
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          type: 'NO_SHOW',
                          appointmentId: appt.id,
                          title: 'Mark No-Show',
                          message: 'Mark that the patient failed to attend the scheduled visit?',
                        })
                      }
                    >
                      No Show
                    </Button>
                  </div>
                )}

                {(appt.status === 'COMPLETED' || appt.status === 'CANCELLED' || appt.status === 'NO_SHOW') && (
                  <div className="text-center py-1">
                    <span className="text-xs text-navy-400 italic">No further actions required</span>
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
        confirmText="Proceed"
      />
    </div>
  );
}

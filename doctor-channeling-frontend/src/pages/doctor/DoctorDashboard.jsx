import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/bookingApi';
import { doctorApi } from '../../api/directoryApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/appointments/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  CalendarCheck,
  User,
  Stethoscope,
  ChevronRight,
  Phone,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [selectedAppt, setSelectedAppt] = useState(null);

  useEffect(() => {
    async function loadDoctorData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const docListRes = await doctorApi.getAll().catch(() => ({ data: { data: [] } }));
        const allDocs = docListRes.data?.data || [];
        const currentDoc = allDocs.find((d) => d.userId === user.id) || allDocs[0];
        setDoctorProfile(currentDoc);

        const docId = currentDoc?.id || user.id;
        const appRes = await appointmentApi.getByDoctor(docId).catch(() => ({ data: { data: [] } }));
        setAppointments(appRes.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctorData();
  }, [user?.id]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Appointments categorization
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
  const upcomingAppointments = appointments
    .filter((a) => a.appointmentDate > todayStr && a.status !== 'CANCELLED')
    .sort((a, b) => (a.appointmentDate > b.appointmentDate ? 1 : -1));
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');

  // Unique patients count
  const uniquePatients = new Set(appointments.map((a) => a.patientId).filter(Boolean)).size;

  const handleCompleteAppointment = async (id) => {
    try {
      await appointmentApi.complete(id);
      toast.success('Consultation marked as completed');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'COMPLETED' } : a))
      );
      if (selectedAppt?.id === id) {
        setSelectedAppt((prev) => ({ ...prev, status: 'COMPLETED' }));
      }
    } catch (err) {
      toast.error('Failed to update consultation status');
    }
  };

  const handleConfirmAppointment = async (id) => {
    try {
      await appointmentApi.confirm(id);
      toast.success('Consultation confirmed');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CONFIRMED' } : a))
      );
      if (selectedAppt?.id === id) {
        setSelectedAppt((prev) => ({ ...prev, status: 'CONFIRMED' }));
      }
    } catch (err) {
      toast.error('Failed to confirm appointment');
    }
  };

  if (loading) return <Loader text="Loading doctor control center..." />;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-navy-900 via-navy-850 to-primary-950 p-6 md:p-7 text-white shadow-sm border border-navy-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-200 border border-primary-400/30">
              <Stethoscope className="w-3.5 h-3.5 text-primary-400" />
              <span>Doctor Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Welcome back, Dr. {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-xs md:text-sm text-navy-200">
              {doctorProfile?.specialization?.name || 'Medical Specialist'} •{' '}
              {doctorProfile?.qualifications || 'Certified Healthcare Practitioner'}
            </p>
          </div>

          {/* Quick actions in hero */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link to="/doctor/schedule">
              <Button variant="primary" size="md" className="gap-2 shadow-xs">
                <CalendarCheck className="w-4 h-4" /> View Schedule
              </Button>
            </Link>
            <Link to="/doctor/patients">
              <Button
                variant="secondary"
                size="md"
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Users className="w-4 h-4" /> View Patients
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Today's Overview: 4 KPI Stats */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-navy-400">
          Today's Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            icon={CalendarCheck}
            label="Today's Appointments"
            value={todayAppointments.length}
            description="Booked for today's clinics"
            iconClassName="bg-primary-50 text-primary-600"
          />
          <StatCard
            icon={Clock}
            label="Upcoming Appointments"
            value={upcomingAppointments.length}
            description="Scheduled for future dates"
            iconClassName="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed Visits"
            value={completedAppointments.length}
            description="Successfully consulted"
            iconClassName="bg-accent-50 text-accent-600"
          />
          <StatCard
            icon={Users}
            label="Total Patients"
            value={uniquePatients}
            description="Unique patients consulted"
            iconClassName="bg-purple-50 text-purple-600"
          />
        </div>
      </div>

      {/* 3. Today's Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Today's Schedule</h2>
            <p className="text-xs text-navy-500">
              Patients scheduled for consultation today ({todayStr})
            </p>
          </div>
          <Link
            to="/doctor/appointments"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            All appointments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments scheduled for today"
            description="You currently have no patient appointments booked for today's channeling session."
            actionLabel="Check Full Schedule"
            onAction={() => (window.location.href = '/doctor/schedule')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayAppointments.map((appt) => (
              <Card
                key={appt.id}
                className="bg-white border border-navy-100 p-5 flex flex-col justify-between hover:shadow-sm transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-navy-100">
                    <span className="font-mono text-xs font-bold text-navy-400">
                      #{appt.appointmentNumber || appt.id?.slice(0, 8)}
                    </span>
                    <StatusBadge status={appt.status} />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 border border-primary-100 flex items-center justify-center font-bold text-sm shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-navy-900 text-sm truncate">
                        Patient #{appt.patientId?.slice(0, 8)}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-navy-600 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-primary-600" />
                        <span className="font-semibold text-navy-800">
                          {appt.startTime?.slice(0, 5)} - {appt.endTime?.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {appt.reason && (
                    <p className="text-xs text-navy-600 bg-navy-50/70 p-2.5 rounded-xl border border-navy-100/60 line-clamp-2">
                      <span className="font-medium text-navy-800">Reason: </span>
                      {appt.reason}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-navy-100 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setSelectedAppt(appt)}
                  >
                    View Details
                  </Button>
                  {appt.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleConfirmAppointment(appt.id)}
                    >
                      Confirm
                    </Button>
                  )}
                  {appt.status === 'CONFIRMED' && (
                    <Button
                      variant="accent"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleCompleteAppointment(appt.id)}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 4. Upcoming Appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Upcoming Appointments</h2>
            <p className="text-xs text-navy-500">Scheduled consultations for future clinic dates</p>
          </div>
          <Link
            to="/doctor/appointments"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View all ({upcomingAppointments.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <Card className="bg-white border border-navy-100 p-6 text-center text-sm text-navy-400">
            No upcoming appointments scheduled after today.
          </Card>
        ) : (
          <Card className="bg-white border border-navy-100 divide-y divide-navy-100 overflow-hidden">
            {upcomingAppointments.slice(0, 5).map((appt) => (
              <div
                key={appt.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-navy-50/50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-navy-100 text-navy-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Calendar className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-navy-900">
                        Patient #{appt.patientId?.slice(0, 8)}
                      </span>
                      <StatusBadge status={appt.status} />
                    </div>
                    <p className="text-xs text-navy-500 mt-0.5 flex items-center gap-2">
                      <span>{appt.appointmentDate}</span>
                      <span>•</span>
                      <span>{appt.startTime?.slice(0, 5)}</span>
                      {appt.reason && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{appt.reason}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary-700 hover:bg-primary-50 gap-1"
                    onClick={() => setSelectedAppt(appt)}
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* 5. Quick Actions Row */}
      <div className="p-4 bg-navy-50/70 rounded-2xl border border-navy-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-primary-600" />
          <span className="text-xs font-semibold text-navy-700">Quick Navigation:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/doctor/schedule">
            <Button variant="secondary" size="sm" className="text-xs">
              Configure Timetable
            </Button>
          </Link>
          <Link to="/doctor/patients">
            <Button variant="secondary" size="sm" className="text-xs">
              Patient Registry
            </Button>
          </Link>
          <Link to="/doctor/profile">
            <Button variant="secondary" size="sm" className="text-xs">
              Edit Doctor Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        title="Consultation Details"
        subtitle={`Appointment Reference #${selectedAppt?.appointmentNumber || selectedAppt?.id?.slice(0, 8)}`}
      >
        {selectedAppt && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-navy-50/70 p-3.5 rounded-xl border border-navy-100">
              <div>
                <p className="text-xs text-navy-400">Current Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedAppt.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-navy-400">Date & Time</p>
                <p className="text-xs font-bold text-navy-900 mt-0.5">
                  {selectedAppt.appointmentDate} • {selectedAppt.startTime?.slice(0, 5)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded-xl border border-navy-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-navy-400">Patient Identifier</p>
                  <p className="text-xs font-bold text-navy-900">{selectedAppt.patientId}</p>
                </div>
              </div>

              {selectedAppt.reason && (
                <div className="p-3 bg-white rounded-xl border border-navy-100 space-y-1">
                  <p className="text-xs font-semibold text-navy-600 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-navy-400" /> Reason for Visit
                  </p>
                  <p className="text-xs text-navy-700">{selectedAppt.reason}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-navy-100">
              <Button variant="secondary" size="md" onClick={() => setSelectedAppt(null)}>
                Close
              </Button>
              {selectedAppt.status === 'CONFIRMED' && (
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => handleCompleteAppointment(selectedAppt.id)}
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

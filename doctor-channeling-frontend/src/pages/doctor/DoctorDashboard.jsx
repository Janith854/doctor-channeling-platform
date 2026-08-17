import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/bookingApi';
import { scheduleApi } from '../../api/scheduleApi';
import { notificationApi } from '../../api/notificationApi';
import { doctorApi } from '../../api/directoryApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    async function loadDoctorData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        // Find doctor entity linked to user.id
        const docListRes = await doctorApi.getAll();
        const allDocs = docListRes.data?.data || [];
        const currentDoc = allDocs.find((d) => d.userId === user.id) || allDocs[0];
        setDoctorProfile(currentDoc);

        const docId = currentDoc?.id || user.id;

        const [appRes, schedRes, notifRes] = await Promise.allSettled([
          appointmentApi.getByDoctor(docId),
          scheduleApi.getByDoctor(docId),
          notificationApi.getByUser(user.id),
        ]);

        if (appRes.status === 'fulfilled') setAppointments(appRes.value.data?.data || []);
        if (schedRes.status === 'fulfilled') setSchedules(schedRes.value.data?.data || []);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctorData();
  }, [user?.id]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
  const pendingAppointments = appointments.filter((a) => a.status === 'PENDING');
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');

  const handleCompleteAppointment = async (id) => {
    try {
      await appointmentApi.complete(id);
      toast.success('Appointment marked as completed');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'COMPLETED' } : a))
      );
    } catch (err) {
      toast.error('Failed to complete appointment');
    }
  };

  if (loading) return <Loader text="Loading doctor dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold text-primary-300 mb-3">
            Doctor Channeling Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dr. {user?.firstName} {user?.lastName}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-navy-200 leading-relaxed">
            {doctorProfile?.specialization?.name || 'Practitioner'} • {doctorProfile?.qualifications || 'Consultant Specialist'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/doctor/schedule">
              <Button variant="primary" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" /> Manage Schedules
              </Button>
            </Link>
            <Link to="/doctor/appointments">
              <Button variant="secondary" size="sm" className="gap-2 text-white border-white/20 bg-white/10 hover:bg-white/20">
                <ClipboardCheck className="w-4 h-4" /> View All Appointments
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border border-navy-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">Today's Patients</span>
            <h3 className="text-2xl font-extrabold text-navy-900">{todayAppointments.length}</h3>
          </div>
        </Card>

        <Card className="bg-white border border-navy-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-warning-50 text-warning-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">Pending Confirmation</span>
            <h3 className="text-2xl font-extrabold text-navy-900">{pendingAppointments.length}</h3>
          </div>
        </Card>

        <Card className="bg-white border border-navy-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">Completed Consultations</span>
            <h3 className="text-2xl font-extrabold text-navy-900">{completedAppointments.length}</h3>
          </div>
        </Card>
      </div>

      {/* Today's Appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Today's Consultations ({todayStr})</h2>
            <p className="text-xs text-navy-400">Patients scheduled for channeling today</p>
          </div>
          <Link to="/doctor/appointments" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
            See all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <Card className="bg-white border border-navy-100 p-8 text-center text-sm text-navy-400">
            No consultations scheduled for today.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayAppointments.map((appt) => (
              <Card key={appt.id} className="bg-white border border-navy-100 p-5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-navy-400">#{appt.appointmentNumber || appt.id?.slice(0, 8)}</span>
                    <Badge status={appt.status} />
                  </div>
                  <h4 className="font-bold text-navy-900 text-sm">Patient ID: {appt.patientId?.slice(0, 8)}</h4>
                  <div className="text-xs text-navy-600 bg-navy-50 p-2.5 rounded-xl flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span>{appt.startTime?.slice(0, 5)} - {appt.endTime?.slice(0, 5)}</span>
                  </div>
                  {appt.reason && <p className="text-xs text-navy-500 italic">"{appt.reason}"</p>}
                </div>

                {appt.status !== 'COMPLETED' && (
                  <div className="mt-4 pt-3 border-t border-navy-100">
                    <Button
                      variant="accent"
                      size="sm"
                      fullWidth
                      onClick={() => handleCompleteAppointment(appt.id)}
                    >
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Active Schedules Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Weekly Channeling Schedules</h2>
            <p className="text-xs text-navy-400">Configured regular schedule templates</p>
          </div>
          <Link to="/doctor/schedule" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
            Manage <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {schedules.map((sch) => (
            <Card key={sch.id} className="bg-white border border-navy-100 p-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg">
                  {sch.dayOfWeek}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${sch.active ? 'bg-accent-50 text-accent-700' : 'bg-navy-100 text-navy-500'}`}>
                  {sch.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-xs text-navy-700 font-semibold flex items-center gap-2 pt-1">
                <Clock className="w-4 h-4 text-navy-400" />
                <span>{sch.startTime?.slice(0, 5)} - {sch.endTime?.slice(0, 5)}</span>
              </div>
              <p className="text-[11px] text-navy-400">Duration: {sch.slotDurationMinutes || 20} mins per slot</p>
            </Card>
          ))}
          {schedules.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-2xl border border-navy-100 text-center text-sm text-navy-400">
              No weekly schedules configured. Click "Manage Schedules" to add your first clinic timetable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

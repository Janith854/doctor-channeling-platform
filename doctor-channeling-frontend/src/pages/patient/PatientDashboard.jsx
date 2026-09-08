import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/bookingApi';
import { doctorApi } from '../../api/directoryApi';
import { paymentApi } from '../../api/paymentApi';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/appointments/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import DoctorCard from '../../components/doctors/DoctorCard';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import Loader from '../../components/common/Loader';
import {
  Calendar,
  Search,
  CreditCard,
  Clock,
  ArrowRight,
  UserCheck,
  Stethoscope,
  ChevronRight,
  Plus,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, spent: 0 });

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [appRes, docRes, payRes] = await Promise.allSettled([
          appointmentApi.getByPatient(user.id),
          doctorApi.getAll(),
          paymentApi.getByPatient(user.id),
        ]);

        const appData = appRes.status === 'fulfilled' ? appRes.value.data?.data || [] : [];
        const docData = docRes.status === 'fulfilled' ? docRes.value.data?.data || [] : [];
        const payData = payRes.status === 'fulfilled' ? payRes.value.data?.data || [] : [];

        setAppointments(appData);
        setDoctors(docData);
        setPayments(payData);

        const upcomingCount = appData.filter(
          (a) => a.status === 'PENDING' || a.status === 'CONFIRMED'
        ).length;
        const completedCount = appData.filter((a) => a.status === 'COMPLETED').length;
        const totalSpent = payData
          .filter((p) => p.status === 'PAID')
          .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        setStats({ upcoming: upcomingCount, completed: completedCount, spent: totalSpent });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const handleCancelAppointment = async (id) => {
    try {
      await appointmentApi.cancel(id, { reason: 'Cancelled by patient from dashboard' });
      toast.success('Appointment cancelled successfully');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a))
      );
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  if (loading) return <Loader text="Loading your health portal..." />;

  const upcomingAppointment = appointments.find(
    (a) => a.status === 'PENDING' || a.status === 'CONFIRMED'
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Welcome Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e7490] via-[#0891b2] to-[#06b6d4] p-6 sm:p-8 text-white shadow-lg">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-14 -left-6 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 text-white/90 px-3 py-1 rounded-full border border-white/20">
              <Stethoscope className="w-3.5 h-3.5" /> Patient Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {getGreeting()}, {user?.firstName || 'there'}!
            </h1>
            <p className="text-sm text-white/80 max-w-md">
              Find doctors, manage appointments, and keep track of your healthcare visits.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/patient/doctors">
              <button
                id="btn-find-doctor"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-semibold transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" /> Find a Doctor
              </button>
            </Link>
            <Link to="/patient/book">
              <button
                id="btn-book-appointment"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary-700 hover:bg-white/90 text-sm font-semibold transition-all shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Book Appointment
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick Statistics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Calendar}
          label="Upcoming Visits"
          value={stats.upcoming}
          description="Scheduled consultations"
          iconClassName="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={UserCheck}
          label="Completed Visits"
          value={stats.completed}
          description="Past consultations"
          iconClassName="bg-accent-50 text-accent-600"
        />
        <StatCard
          icon={CreditCard}
          label="Total Paid"
          value={`$${stats.spent.toFixed(2)}`}
          description="Channeling fees settled"
          iconClassName="bg-purple-50 text-purple-600"
        />
      </div>

      {/* ── Upcoming Appointment Spotlight ── */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">Upcoming Appointment</h2>
        {upcomingAppointment ? (
          <div className="bg-white border border-primary-200/70 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">
                      Next Consultation
                    </span>
                    <StatusBadge status={upcomingAppointment.status} />
                  </div>
                  <h3 className="font-bold text-navy-900 text-base">
                    Appointment #{upcomingAppointment.appointmentNumber || upcomingAppointment.id?.slice(0, 8)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-navy-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary-500" />
                      <span className="font-semibold text-navy-800">{upcomingAppointment.appointmentDate}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary-500" />
                      <span className="font-semibold text-navy-800">{upcomingAppointment.startTime?.slice(0, 5)}</span>
                    </span>
                    {upcomingAppointment.hospitalId && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-navy-400" />
                        <span>Hospital</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                to={`/patient/appointments/${upcomingAppointment.id}`}
                id="btn-view-upcoming-details"
                className="shrink-0"
              >
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap">
                  View Details <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-navy-100 rounded-2xl p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-navy-700 text-sm">No upcoming appointments</p>
              <p className="text-xs text-navy-400 mt-0.5">Book a consultation with a doctor to get started.</p>
            </div>
            <Link to="/patient/doctors">
              <button
                id="btn-empty-find-doctor"
                className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" /> Find a Doctor
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* ── Featured Specialists ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900">Featured Specialists</h2>
            <p className="text-xs text-navy-400 mt-0.5">Top medical practitioners available for booking</p>
          </div>
          <Link
            to="/patient/doctors"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No doctors available yet"
            description="Doctors will appear here when they are added to the directory."
            actionLabel="Browse Directory"
            onAction={() => (window.location.href = '/patient/doctors')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.slice(0, 3).map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>

      {/* ── Recent Appointments ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900">Recent Appointments</h2>
            <p className="text-xs text-navy-400 mt-0.5">Your latest channeling history</p>
          </div>
          <Link
            to="/patient/appointments"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments scheduled yet"
            description="Book your first appointment with a doctor to get started."
            actionLabel="Book Appointment"
            onAction={() => (window.location.href = '/patient/book')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.slice(0, 3).map((app) => (
              <AppointmentCard
                key={app.id}
                appointment={app}
                role="PATIENT"
                onCancel={handleCancelAppointment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

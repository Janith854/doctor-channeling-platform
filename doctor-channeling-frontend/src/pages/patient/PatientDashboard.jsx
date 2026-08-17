import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/bookingApi';
import { doctorApi, hospitalApi } from '../../api/directoryApi';
import { paymentApi } from '../../api/paymentApi';
import { notificationApi } from '../../api/notificationApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import DoctorCard from '../../components/doctors/DoctorCard';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import Loader from '../../components/common/Loader';
import {
  Calendar,
  Search,
  CreditCard,
  Bell,
  Clock,
  ArrowRight,
  UserCheck,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, spent: 0 });

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [appRes, docRes, payRes, notifRes] = await Promise.allSettled([
          appointmentApi.getByPatient(user.id),
          doctorApi.getAll(),
          paymentApi.getByPatient(user.id),
          notificationApi.getByUser(user.id),
        ]);

        const appData = appRes.status === 'fulfilled' ? appRes.value.data?.data || [] : [];
        const docData = docRes.status === 'fulfilled' ? docRes.value.data?.data || [] : [];
        const payData = payRes.status === 'fulfilled' ? payRes.value.data?.data || [] : [];
        const notifData = notifRes.status === 'fulfilled' ? notifRes.value.data?.data || [] : [];

        setAppointments(appData);
        setDoctors(docData);
        setPayments(payData);
        setNotifications(notifData);

        const upcomingCount = appData.filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
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

  if (loading) return <Loader text="Loading your dashboard..." />;

  const upcomingAppointment = appointments.find(
    (a) => a.status === 'PENDING' || a.status === 'CONFIRMED'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold text-primary-300 mb-3">
            Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.firstName || 'Patient'}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-navy-200 leading-relaxed">
            Find top medical specialists, book channeling appointments, and manage your healthcare schedule in one place.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/patient/doctors">
              <Button variant="accent" size="sm" className="gap-2">
                <Search className="w-4 h-4" /> Find Doctors
              </Button>
            </Link>
            <Link to="/patient/book">
              <Button variant="primary" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" /> Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border border-navy-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">Upcoming Visits</span>
            <h3 className="text-2xl font-extrabold text-navy-900">{stats.upcoming}</h3>
          </div>
        </Card>

        <Card className="bg-white border border-navy-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">Completed Visits</span>
            <h3 className="text-2xl font-extrabold text-navy-900">{stats.completed}</h3>
          </div>
        </Card>

        <Card className="bg-white border border-navy-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">Total Paid</span>
            <h3 className="text-2xl font-extrabold text-navy-900">${stats.spent.toFixed(2)}</h3>
          </div>
        </Card>
      </div>

      {/* Upcoming Appointment Alert */}
      {upcomingAppointment && (
        <Card className="bg-gradient-to-r from-primary-50 to-cyan-50 border border-primary-100 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Next Appointment</span>
                  <Badge status={upcomingAppointment.status} />
                </div>
                <h4 className="font-extrabold text-navy-900 text-base mt-0.5">
                  Appt #{upcomingAppointment.appointmentNumber || upcomingAppointment.id?.slice(0, 8)}
                </h4>
                <p className="text-xs text-navy-600 mt-1">
                  Date: <span className="font-bold text-navy-800">{upcomingAppointment.appointmentDate}</span> at{' '}
                  <span className="font-bold text-navy-800">{upcomingAppointment.startTime?.slice(0, 5)}</span>
                </p>
              </div>
            </div>
            <Link to={`/patient/appointments/${upcomingAppointment.id}`}>
              <Button variant="primary" size="sm" className="gap-1.5 whitespace-nowrap">
                View Details <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Available Doctors Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Featured Specialists</h2>
            <p className="text-xs text-navy-400">Top medical practitioners available for booking</p>
          </div>
          <Link to="/patient/doctors" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.slice(0, 3).map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
          {doctors.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-2xl border border-navy-100 text-center text-sm text-navy-400">
              No doctors listed in the directory yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Recent Appointments</h2>
            <p className="text-xs text-navy-400">Your recent channeling history and bookings</p>
          </div>
          <Link to="/patient/appointments" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
            All appointments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.slice(0, 3).map((app) => (
            <AppointmentCard
              key={app.id}
              appointment={app}
              role="PATIENT"
              onCancel={handleCancelAppointment}
            />
          ))}
          {appointments.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-2xl border border-navy-100 text-center text-sm text-navy-400">
              You haven't booked any appointments yet. Click "Book Appointment" above to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

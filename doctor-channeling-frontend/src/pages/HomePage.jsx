import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorApi, specializationApi, hospitalApi } from '../api/directoryApi';
import DoctorCard from '../components/doctors/DoctorCard';
import Button from '../components/common/Button';
import {
  Stethoscope,
  CalendarCheck,
  Building2,
  Search,
  ShieldCheck,
  ArrowRight,
  Clock,
  Award,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, getRolePath } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [docRes, specRes] = await Promise.all([
          doctorApi.getAll().catch(() => ({ data: { data: [] } })),
          specializationApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);
        setDoctors(docRes.data?.data || []);
        setSpecializations(specRes.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/patient/doctors');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      {/* Public Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-navy-900">
              Medi<span className="text-primary-600">Channel</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={getRolePath()}>
                <Button variant="primary" size="sm" className="gap-1.5">
                  My Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-primary-400 blur-[150px]" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-accent-400 blur-[130px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-primary-300 border border-white/10 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-primary-300" /> Sri Lanka's Modern Doctor Channeling Platform
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Book Top Specialists & Doctors <span className="text-primary-300">In Seconds</span>
          </h1>

          <p className="text-base sm:text-lg text-navy-200 max-w-2xl mx-auto leading-relaxed">
            Directly connect with leading medical consultants, view live clinic timetables, and secure appointments with instant card confirmation.
          </p>

          {/* Quick Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-2 rounded-2xl shadow-2xl max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 border border-white/20"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Doctor name, Cardiology, Pediatrics..."
                className="w-full pl-11 pr-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="gap-2 shrink-0">
              <Search className="w-4 h-4" /> Find Doctors
            </Button>
          </form>
        </div>
      </section>

      {/* Specialties Carousel / List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-navy-900">Explore by Medical Specialty</h2>
          <p className="text-sm text-navy-500 mt-1">Select a specialty to find certified clinical experts</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {specializations.slice(0, 6).map((spec) => (
            <Link
              key={spec.id}
              to={isAuthenticated ? `/patient/doctors` : `/login`}
              className="p-4 bg-white rounded-2xl border border-navy-100 hover:border-primary-300 hover:shadow-lg transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-navy-800 line-clamp-1 group-hover:text-primary-600">{spec.name}</h4>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Doctors */}
      {doctors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-navy-900">Featured Specialists</h2>
              <p className="text-sm text-navy-500 mt-1">Available for channeling appointments</p>
            </div>
            <Link to={isAuthenticated ? '/patient/doctors' : '/login'} className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.slice(0, 3).map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        </section>
      )}

      {/* Trust & Features */}
      <section className="bg-white border-y border-navy-100 py-16 my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-navy-900 text-lg">Verified Doctors</h3>
              <p className="text-xs text-navy-500 max-w-xs mx-auto leading-relaxed">
                All listed doctors hold certified SLMC numbers and credentials from accredited hospitals.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-navy-900 text-lg">Live Slot Booking</h3>
              <p className="text-xs text-navy-500 max-w-xs mx-auto leading-relaxed">
                Real-time appointment slots generated directly from doctor weekly schedules.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-navy-900 text-lg">Instant Pass & Notifications</h3>
              <p className="text-xs text-navy-500 max-w-xs mx-auto leading-relaxed">
                Receive instant channeling booking confirmations, SMS alerts, and email notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-navy-950 text-white py-8 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center text-white">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">MediChannel Platform</span>
          </div>
          <p>© {new Date().getFullYear()} MediChannel Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

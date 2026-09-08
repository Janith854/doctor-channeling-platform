import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorApi, specializationApi } from '../api/directoryApi';
import DoctorCard from '../components/doctors/DoctorCard';
import Button from '../components/common/Button';
import {
  Stethoscope,
  CalendarCheck,
  Search,
  ShieldCheck,
  ArrowRight,
  Clock,
  Award,
  Users,
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
      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-navy-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-navy-900">
              Medi<span className="text-primary-600">Channel</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <Link to={getRolePath()}>
                <Button variant="primary" size="sm" className="gap-1.5">
                  My Dashboard <ArrowRight className="w-3.5 h-3.5" />
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
      <section className="relative overflow-hidden bg-navy-900 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-primary-400 blur-[140px]" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-accent-400 blur-[120px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10 space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-primary-300 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-300" /> Sri Lanka's Verified Healthcare Platform
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Book Top Specialists & Doctors{' '}
            <span className="text-primary-300">In Seconds</span>
          </h1>

          <p className="text-sm sm:text-base text-navy-200 max-w-xl mx-auto leading-relaxed">
            Connect directly with leading medical practitioners, view published consultation schedules, and secure appointments with instant card confirmation.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-2 rounded-2xl shadow-xl max-w-xl mx-auto flex flex-col sm:flex-row gap-2 border border-navy-100/30 text-navy-900 mt-6"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Doctor name, Cardiology, Pediatrics..."
                className="w-full h-10 pl-10 pr-3 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="gap-2 shrink-0">
              <Search className="w-4 h-4" /> Find Doctors
            </Button>
          </form>
        </div>
      </section>

      {/* Specialties Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8 space-y-1">
          <h2 className="text-2xl font-bold text-navy-900">Explore by Medical Specialty</h2>
          <p className="text-xs sm:text-sm text-navy-500">
            Select a specialty to browse certified consultant specialists
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {specializations.slice(0, 6).map((spec) => (
            <Link
              key={spec.id}
              to={isAuthenticated ? `/patient/doctors` : `/login`}
              className="p-4 bg-white rounded-2xl border border-navy-100 hover:border-primary-300 hover:shadow-md transition-all text-center group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-navy-800 line-clamp-1 group-hover:text-primary-600">
                {spec.name}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Specialists */}
      {doctors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-navy-900">Featured Specialists</h2>
              <p className="text-xs text-navy-400">Practitioners available for immediate channeling</p>
            </div>
            <Link
              to={isAuthenticated ? '/patient/doctors' : '/login'}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.slice(0, 3).map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        </section>
      )}

      {/* Trust & Safety Highlights */}
      <section className="bg-white border-y border-navy-100 py-14 my-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-base">SLMC Verified Specialists</h3>
              <p className="text-xs text-navy-500 max-w-xs mx-auto leading-relaxed">
                All practitioners hold certified SLMC numbers and credentials from accredited hospitals.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center mx-auto shadow-2xs">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-base">Live Consultation Slots</h3>
              <p className="text-xs text-navy-500 max-w-xs mx-auto leading-relaxed">
                Real-time appointment slots generated directly from doctor weekly clinic timetables.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-2xs">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-base">Instant Channeling Pass</h3>
              <p className="text-xs text-navy-500 max-w-xs mx-auto leading-relaxed">
                Receive instant channeling booking confirmations, SMS alerts, and email notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-navy-950 text-white py-8 border-t border-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center text-white">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-white">MediChannel Platform</span>
          </div>
          <p>© {new Date().getFullYear()} MediChannel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

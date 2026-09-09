import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorApi, specializationApi, hospitalApi } from '../api/directoryApi';
import Button from '../components/common/Button';
import {
  Stethoscope,
  Search,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  Building2,
  Calendar,
  Heart,
  Brain,
  Baby,
  Activity,
  Bone,
  Eye,
  Star,
  Sparkles,
} from 'lucide-react';

const DEFAULT_SPECIALTIES = [
  { id: '1', name: 'Cardiology', icon: Heart, desc: 'Heart and cardiovascular care' },
  { id: '2', name: 'Pediatrics', icon: Baby, desc: 'Child health and development' },
  { id: '3', name: 'Dermatology', icon: Sparkles, desc: 'Skin, hair, and cosmetic health' },
  { id: '4', name: 'Neurology', icon: Brain, desc: 'Brain and nervous system specialists' },
  { id: '5', name: 'Orthopedics', icon: Bone, desc: 'Bones, joints, and spine care' },
  { id: '6', name: 'General Medicine', icon: Activity, desc: 'Comprehensive primary consultations' },
];

export default function HomePage() {
  const { isAuthenticated, getRolePath } = useAuth();
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');

  useEffect(() => {
    async function loadDirectory() {
      try {
        const [specRes, hospRes] = await Promise.all([
          specializationApi.getAll().catch(() => ({ data: { data: [] } })),
          hospitalApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);
        const apiSpecs = specRes.data?.data || [];
        setSpecializations(apiSpecs.length > 0 ? apiSpecs : DEFAULT_SPECIALTIES);
        setHospitals(hospRes.data?.data || []);
      } catch (err) {
        setSpecializations(DEFAULT_SPECIALTIES);
      }
    }
    loadDirectory();
  }, []);

  const displaySpecialties = specializations.length > 0 ? specializations : DEFAULT_SPECIALTIES;

  const handleSearch = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/patient/doctors');
    } else {
      navigate('/login');
    }
  };

  const handleSpecialtyClick = () => {
    if (isAuthenticated) {
      navigate('/patient/doctors');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy-900 flex flex-col font-sans selection:bg-primary-100 selection:text-primary-800">
      {/* ── 1. Clean Top Navigation ────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-primary-700 to-primary-500 flex items-center justify-center text-white shadow-sm shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-navy-900">
                Medi<span className="text-primary-600">Channel</span>
              </span>
              <span className="hidden sm:block text-[10px] font-semibold text-slate-600 tracking-wider uppercase -mt-1">
                Healthcare Platform
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#search-section" className="hover:text-primary-600 transition-colors">
              Find Doctors
            </a>
            <a href="#specialties" className="hover:text-primary-600 transition-colors">
              Specialties
            </a>
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-primary-600 transition-colors">
              Why Us
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={getRolePath()}>
                <Button variant="primary" size="md" className="gap-2 shadow-xs">
                  Open Portal <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="secondary"
                    size="md"
                    className="border-slate-200 text-slate-700 hover:text-navy-900 hover:bg-slate-100 font-semibold"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md" className="font-semibold shadow-xs">
                    Register Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section (Bright, Airy, High-Contrast) ─────── */}
      <section
        id="search-section"
        className="relative pt-12 pb-20 md:pt-16 md:pb-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-white via-primary-50/20 to-slate-50 border-b border-slate-200/70"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* SLMC Verified Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-800 text-xs font-bold tracking-wide shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-primary-600" />
                <span>Sri Lanka's SLMC Verified Doctor Channeling</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-950 leading-tight">
                Book Top Specialists & Doctors{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-teal-500">
                  In Seconds
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Choose your medical specialist, view real-time hospital timetables, and secure confirmed consultation appointments instantly with zero waiting lines.
              </p>

              {/* Search Card Box */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 text-left space-y-3 mt-4">
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Doctor or Specialty Input */}
                  <div className="sm:col-span-6 relative">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Doctor or Specialization
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Cardiologist, Dr. Perera"
                        value={searchDoctor}
                        onChange={(e) => setSearchDoctor(e.target.value)}
                        className="w-full h-11 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* Hospital Dropdown */}
                  <div className="sm:col-span-4 relative">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Hospital / Location
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <select
                        value={selectedHospital}
                        onChange={(e) => setSelectedHospital(e.target.value)}
                        className="w-full h-11 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 truncate"
                      >
                        <option value="">All Hospitals</option>
                        {hospitals.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="sm:col-span-2 flex items-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full h-11 font-bold text-sm shadow-sm"
                    >
                      Find
                    </Button>
                  </div>
                </form>

                {/* Popular Keywords */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">Popular:</span>
                  {['Cardiology', 'Pediatrics', 'Dermatology', 'Neurology', 'ENT'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchDoctor(tag)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-600 font-medium transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Trust Stats */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-navy-900">500+</p>
                  <p className="text-xs text-slate-500 font-medium">SLMC Specialists</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-navy-900">18+</p>
                  <p className="text-xs text-slate-500 font-medium">Partner Hospitals</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-navy-900">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Verified Bookings</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card (5 cols) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl shadow-slate-300/40 border border-slate-200 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-700">Live Channeling Slot</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 text-primary-700 border border-primary-200">
                    SLMC Certified
                  </span>
                </div>

                {/* Doctor Preview Details */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary-600 to-primary-800 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                    SP
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950">Dr. Samantha Perera</h3>
                    <p className="text-xs font-semibold text-primary-600">Consultant Cardiologist</p>
                    <p className="text-xs text-slate-500 mt-0.5">MBBS, MD, FRCP (London)</p>
                  </div>
                </div>

                {/* Clinic Schedule Detail */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> Center
                    </span>
                    <span className="font-bold text-navy-900">Asiri Central Hospital</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Schedule
                    </span>
                    <span className="font-bold text-navy-900">Today • 04:30 PM - 07:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Slot Availability
                    </span>
                    <span className="font-bold text-emerald-600">Available (#12 Open)</span>
                  </div>
                </div>

                {/* Simulated Action */}
                <div className="pt-1">
                  <Link to={isAuthenticated ? '/patient/doctors' : '/login'}>
                    <Button variant="primary" size="md" fullWidth className="gap-2 font-bold shadow-xs">
                      Book This Session <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {/* Trust Pill */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Instant appointment confirmation with digital pass</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Medical Specialties Grid ───────────────────────── */}
      <section id="specialties" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Departments & Care
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Explore by Medical Specialty
          </h2>
          <p className="text-sm text-slate-600">
            Select a specialized medical discipline to consult board-certified physicians
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {displaySpecialties.slice(0, 6).map((spec, idx) => {
            const IconComponent = spec.icon || Stethoscope;
            return (
              <div
                key={spec.id || idx}
                onClick={handleSpecialtyClick}
                className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-primary-400 hover:shadow-lg hover:shadow-primary-500/5 transition-all text-center cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900 group-hover:text-primary-600 transition-colors">
                    {spec.name}
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 group-hover:text-primary-600 mt-3 inline-flex items-center justify-center gap-1">
                  View Doctors <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. How It Works (Simple 3 Steps) ───────────────────── */}
      <section id="how-it-works" className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Clear & Simple
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
              How MediChannel Works
            </h2>
            <p className="text-sm text-slate-600">
              Channel your specialist in 3 simple, hassle-free steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                1
              </div>
              <h3 className="text-base font-bold text-navy-900">Find Your Doctor</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Search by doctor name, specialty, or hospital facility. Review qualifications, consultant credentials, and practice history.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                2
              </div>
              <h3 className="text-base font-bold text-navy-900">Select Date & Slot</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Choose the most convenient session from live clinical timetables. Select your preferred consultation appointment number.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                3
              </div>
              <h3 className="text-base font-bold text-navy-900">Instant Channeling Pass</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Confirm your booking securely and receive your digital channeling pass with reference number, SMS, and email alerts immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Platform Advantages ─────────────────────────────── */}
      <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-900">SLMC Certified Practitioners</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every specialist is verified with official Sri Lanka Medical Council (SLMC) registry credentials for dependable healthcare.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-900">Multi-Hospital Network</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Channel appointments across accredited private hospitals and clinical centers island-wide from one centralized portal.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-900">Direct Patient Tracking</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Manage all upcoming visits, download digital receipts, track consultation history, and cancel or reschedule when needed.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. Bottom CTA Section ──────────────────────────────── */}
      <section className="bg-navy-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to channel your doctor?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join thousands of patients who book consultations securely and skip the hospital queues.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to={isAuthenticated ? '/patient/doctors' : '/register'}>
              <Button variant="primary" size="lg" className="font-bold gap-2 shadow-md">
                Get Started Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={isAuthenticated ? '/patient' : '/login'}>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold"
              >
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. Clean Minimal Footer ────────────────────────────── */}
      <footer className="bg-navy-950 text-slate-400 text-xs py-10 border-t border-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">
              Medi<span className="text-primary-400">Channel</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-400">
            <a href="#search-section" className="hover:text-white transition-colors">Find Doctors</a>
            <a href="#specialties" className="hover:text-white transition-colors">Specialties</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>

          <p className="text-slate-500">
            © {new Date().getFullYear()} MediChannel Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

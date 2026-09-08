import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorApi, hospitalApi } from '../../api/directoryApi';
import { scheduleApi } from '../../api/scheduleApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import {
  Stethoscope,
  Award,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  ArrowLeft,
  CalendarPlus,
  User,
  BadgeInfo,
} from 'lucide-react';

const DAY_ORDER = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-navy-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-navy-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-navy-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoctor() {
      if (!id) return;
      try {
        setLoading(true);
        const [docRes, schedRes, hospRes] = await Promise.allSettled([
          doctorApi.getById(id),
          scheduleApi.getByDoctor(id),
          hospitalApi.getAll(),
        ]);

        if (docRes.status === 'fulfilled') setDoctor(docRes.value.data?.data || null);
        if (schedRes.status === 'fulfilled') setSchedules(schedRes.value.data?.data || []);
        if (hospRes.status === 'fulfilled') setHospitals(hospRes.value.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctor();
  }, [id]);

  if (loading) return <Loader text="Loading practitioner details..." />;
  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <EmptyState
          icon={Stethoscope}
          title="Practitioner Not Found"
          description="The doctor profile you are searching for does not exist or has been removed."
          actionLabel="Back to Directory"
          onAction={() => (window.location.href = '/patient/doctors')}
        />
      </div>
    );
  }

  const hospitalMap = Object.fromEntries(hospitals.map((h) => [h.id, h.name]));
  const rawName = doctor.fullName || doctor.name || '';
  const displayName = rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`;
  const initial = rawName.replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase() || 'D';
  const specializationName = doctor.specialization?.name || 'General Practitioner';

  const sortedSchedules = [...schedules].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back link */}
      <Link
        to="/patient/doctors"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
      </Link>

      {/* ── Profile Header Card ── */}
      <div className="bg-white border border-navy-100 rounded-2xl overflow-hidden shadow-xs">
        {/* Top banner */}
        <div className="h-24 bg-gradient-to-r from-[#0e7490] to-[#06b6d4]" />

        <div className="px-6 pb-6">
          {/* Avatar overlapping banner */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md text-primary-700 flex items-center justify-center text-2xl font-bold shrink-0">
              {initial}
            </div>
            <Link
              to={`/patient/book?doctorId=${doctor.id}`}
              id="btn-book-from-profile"
              className="sm:mb-1"
            >
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow cursor-pointer">
                <CalendarPlus className="w-4 h-4" /> Book Appointment
              </button>
            </Link>
          </div>

          {/* Name + specialty */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-navy-900">{displayName}</h1>
              {doctor.slmcNumber && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-700 bg-accent-50 border border-accent-200/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> SLMC #{doctor.slmcNumber}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-primary-700 font-semibold text-sm">
              <Stethoscope className="w-4 h-4 text-primary-600" />
              <span>{specializationName}</span>
            </div>
          </div>

          {/* Bio */}
          {doctor.bio && (
            <div className="mt-5 pt-5 border-t border-navy-100">
              <h3 className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> About the Doctor
              </h3>
              <p className="text-sm text-navy-600 leading-relaxed">{doctor.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Details + Schedule side-by-side on larger screens ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Details */}
        <div className="lg:col-span-2 bg-white border border-navy-100 rounded-2xl p-5 shadow-xs h-fit">
          <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2 mb-1">
            <BadgeInfo className="w-4 h-4 text-primary-600" /> Professional Details
          </h2>
          <div className="mt-3">
            <InfoRow
              icon={Award}
              label="Qualifications"
              value={doctor.qualifications}
            />
            <InfoRow
              icon={Stethoscope}
              label="Specialization"
              value={specializationName}
            />
            <InfoRow
              icon={ShieldCheck}
              label="SLMC Registration"
              value={doctor.slmcNumber ? `#${doctor.slmcNumber}` : null}
            />
            <InfoRow
              icon={Building2}
              label="Primary Hospital"
              value={doctor.hospitalName || (doctor.hospitalId ? hospitalMap[doctor.hospitalId] : null)}
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="lg:col-span-3 bg-white border border-navy-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-900">Available Schedule</h2>
              <p className="text-xs text-navy-400">Regular clinic consultation hours</p>
            </div>
          </div>

          {sortedSchedules.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No published schedule"
              description="The doctor does not currently have published regular channeling slots."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedSchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-3.5 rounded-xl border border-navy-100 bg-navy-50/40 hover:border-primary-200 hover:bg-primary-50/20 transition-all space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-0.5 rounded-lg">
                      {sch.dayOfWeek}
                    </span>
                    <span className="text-[11px] text-navy-400 font-medium">
                      {sch.slotDurationMinutes || 20} min slots
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-navy-800 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-primary-600" />
                    <span>{sch.startTime?.slice(0, 5)} – {sch.endTime?.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-navy-500">
                    <Building2 className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                    <span className="truncate">
                      {hospitalMap[sch.hospitalId] || `Hospital #${sch.hospitalId?.slice(0, 8)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky Book CTA (mobile) ── */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 p-4 bg-white border-t border-navy-100 shadow-lg z-30">
        <Link to={`/patient/book?doctorId=${doctor.id}`} className="block">
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-all cursor-pointer">
            <CalendarPlus className="w-4 h-4" /> Book an Appointment
          </button>
        </Link>
      </div>
    </div>
  );
}

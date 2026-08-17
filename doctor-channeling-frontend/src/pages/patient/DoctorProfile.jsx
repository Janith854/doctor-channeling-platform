import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorApi, affiliationApi, hospitalApi } from '../../api/directoryApi';
import { scheduleApi } from '../../api/scheduleApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import {
  Stethoscope,
  Award,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  ArrowLeft,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react';

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

  if (loading) return <Loader text="Loading doctor profile..." />;
  if (!doctor) return <div className="text-center py-12 text-navy-400">Doctor not found</div>;

  const hospitalMap = Object.fromEntries(hospitals.map((h) => [h.id, h.name]));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/patient/doctors" className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Doctor Directory
      </Link>

      {/* Profile Header */}
      <Card className="bg-white border border-navy-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-primary-500/20 shrink-0">
            {doctor.fullName ? doctor.fullName.replace('Dr. ', '').charAt(0) : 'D'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
                {doctor.fullName?.startsWith('Dr.') ? doctor.fullName : `Dr. ${doctor.fullName || 'Unknown'}`}
              </h1>
              {doctor.slmcNumber && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 bg-accent-50 border border-accent-200 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> SLMC Verified: {doctor.slmcNumber}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-primary-600 font-semibold text-base mt-1">
              <Stethoscope className="w-5 h-5" />
              <span>{doctor.specialization?.name || 'Medical Specialist'}</span>
            </div>

            {doctor.qualifications && (
              <div className="flex items-center gap-2 text-xs text-navy-600 mt-2 bg-navy-50 px-3 py-1.5 rounded-xl w-fit">
                <Award className="w-4 h-4 text-primary-600" />
                <span>{doctor.qualifications}</span>
              </div>
            )}
          </div>

          <Link to={`/patient/book?doctorId=${doctor.id}`} className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
              <Calendar className="w-5 h-5" /> Book Channeling
            </Button>
          </Link>
        </div>

        {doctor.bio && (
          <div className="mt-6 pt-6 border-t border-navy-100">
            <h3 className="text-sm font-bold text-navy-900 mb-2">About Doctor</h3>
            <p className="text-sm text-navy-600 leading-relaxed">{doctor.bio}</p>
          </div>
        )}
      </Card>

      {/* Weekly Schedules */}
      <Card className="bg-white border border-navy-100 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" /> Regular Channeling Schedule
        </h2>

        {schedules.length === 0 ? (
          <p className="text-sm text-navy-400 py-4">No published weekly schedule found for this doctor.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {schedules.map((sch) => (
              <div
                key={sch.id}
                className="p-4 rounded-2xl border border-navy-100 bg-navy-50/50 hover:bg-white hover:shadow-md transition-all space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg">
                    {sch.dayOfWeek}
                  </span>
                  <span className="text-xs text-navy-500 font-medium">
                    {sch.slotDurationMinutes || 20} mins / slot
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-navy-700 font-semibold">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>{sch.startTime?.slice(0, 5)} - {sch.endTime?.slice(0, 5)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-navy-600">
                  <Building2 className="w-4 h-4 text-navy-400" />
                  <span>{hospitalMap[sch.hospitalId] || `Hospital #${sch.hospitalId?.slice(0, 8)}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

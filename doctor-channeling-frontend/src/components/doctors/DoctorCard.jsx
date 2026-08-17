import { Link } from 'react-router-dom';
import { Stethoscope, Award, ChevronRight } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function DoctorCard({ doctor }) {
  if (!doctor) return null;

  const rawName =
    doctor.fullName ||
    (doctor.firstName ? `${doctor.firstName} ${doctor.lastName || ''}`.trim() : '') ||
    doctor.name ||
    'Unknown Doctor';

  const displayName = rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`;
  const initial = rawName.replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase() || 'D';

  const specializationName =
    doctor.specialization?.name ||
    doctor.specializationName ||
    (typeof doctor.specialization === 'string' ? doctor.specialization : '') ||
    'General Practitioner';

  const doctorId = doctor.id || doctor.doctorId || doctor.userId;

  return (
    <Card hover className="flex flex-col justify-between h-full bg-white border border-navy-100 group transition-all duration-300">
      <div>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-navy-900 text-lg group-hover:text-primary-600 transition-colors line-clamp-1">
              {displayName}
            </h3>
            <div className="flex items-center gap-1.5 text-primary-600 text-sm font-medium mt-0.5">
              <Stethoscope className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">{specializationName}</span>
            </div>
            {doctor.slmcNumber && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy-400 bg-navy-50 px-2 py-0.5 rounded-md mt-2">
                SLMC: {doctor.slmcNumber}
              </span>
            )}
          </div>
        </div>

        {doctor.qualifications && (
          <div className="mt-4 flex items-start gap-2 text-xs text-navy-600 bg-navy-50/70 p-2.5 rounded-xl">
            <Award className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">{doctor.qualifications}</p>
          </div>
        )}

        {doctor.bio && (
          <p className="text-xs text-navy-500 mt-3 line-clamp-2 leading-relaxed">
            {doctor.bio}
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-navy-100 flex items-center gap-3">
        <Link to={`/patient/doctors/${doctorId}`} className="flex-1">
          <Button variant="secondary" size="sm" fullWidth>
            View Profile
          </Button>
        </Link>
        <Link to={`/patient/book?doctorId=${doctorId}`} className="flex-1">
          <Button variant="primary" size="sm" fullWidth className="gap-1">
            Book <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

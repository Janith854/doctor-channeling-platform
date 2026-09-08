import { Link } from 'react-router-dom';
import { Stethoscope, Award, ChevronRight, MapPin } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function DoctorCard({ doctor }) {
  if (!doctor) return null;

  const rawName =
    doctor.fullName ||
    (doctor.firstName ? `${doctor.firstName} ${doctor.lastName || ''}`.trim() : '') ||
    doctor.name ||
    'Practitioner';

  const displayName = rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`;
  const initial = rawName.replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase() || 'D';

  const specializationName =
    doctor.specialization?.name ||
    doctor.specializationName ||
    (typeof doctor.specialization === 'string' ? doctor.specialization : '') ||
    'General Practitioner';

  const doctorId = doctor.id || doctor.doctorId || doctor.userId;

  return (
    <Card hover className="flex flex-col justify-between h-full bg-white border border-navy-100 group">
      <div>
        <div className="flex items-start gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-primary-50 text-primary-700 border border-primary-100 flex items-center justify-center text-lg font-bold shrink-0 shadow-2xs group-hover:scale-102 transition-transform">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-navy-900 text-base group-hover:text-primary-600 transition-colors truncate">
              {displayName}
            </h3>
            <div className="flex items-center gap-1.5 text-primary-700 text-xs font-medium mt-0.5">
              <Stethoscope className="w-3.5 h-3.5 shrink-0 text-primary-600" />
              <span className="truncate">{specializationName}</span>
            </div>
            {doctor.slmcNumber && (
              <span className="inline-block text-[10px] font-semibold text-navy-500 bg-navy-50 border border-navy-100 px-2 py-0.5 rounded-md mt-1.5">
                SLMC #{doctor.slmcNumber}
              </span>
            )}
          </div>
        </div>

        {doctor.qualifications && (
          <div className="mt-3.5 flex items-start gap-2 text-xs text-navy-600 bg-navy-50/60 p-2.5 rounded-xl border border-navy-100/60">
            <Award className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">{doctor.qualifications}</p>
          </div>
        )}

        {doctor.bio && (
          <p className="text-xs text-navy-400 mt-2.5 line-clamp-2 leading-relaxed">
            {doctor.bio}
          </p>
        )}
      </div>

      <div className="mt-5 pt-3.5 border-t border-navy-100 flex items-center gap-2.5">
        <Link to={`/patient/doctors/${doctorId}`} className="flex-1">
          <Button variant="secondary" size="sm" fullWidth>
            View Profile
          </Button>
        </Link>
        <Link to={`/patient/book?doctorId=${doctorId}`} className="flex-1">
          <Button variant="primary" size="sm" fullWidth className="gap-1">
            Book <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

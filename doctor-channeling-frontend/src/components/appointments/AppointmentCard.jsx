import { Calendar, Clock, MapPin, User, ChevronRight, FileText } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import StatusBadge from './StatusBadge';
import { Link } from 'react-router-dom';

export default function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
  role = 'PATIENT',
  doctorName = '',
  hospitalName = '',
  patientName = '',
}) {
  if (!appointment) return null;

  return (
    <Card hover className="bg-white border border-navy-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-navy-100">
          <div>
            <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider block">
              Appointment No.
            </span>
            <span className="text-sm font-extrabold text-primary-700">
              #{appointment.appointmentNumber || appointment.id?.slice(0, 8)}
            </span>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <div className="mt-4 space-y-2.5">
          {role === 'PATIENT' ? (
            <div className="flex items-center gap-2.5 text-sm font-semibold text-navy-800">
              <User className="w-4 h-4 text-primary-500 shrink-0" />
              <span className="truncate">{doctorName || `Doctor #${appointment.doctorId?.slice(0, 8)}`}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-sm font-semibold text-navy-800">
              <User className="w-4 h-4 text-accent-500 shrink-0" />
              <span className="truncate">{patientName || `Patient #${appointment.patientId?.slice(0, 8)}`}</span>
            </div>
          )}

          {hospitalName && (
            <div className="flex items-center gap-2.5 text-xs text-navy-600">
              <MapPin className="w-4 h-4 text-navy-400 shrink-0" />
              <span className="truncate">{hospitalName}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-navy-600 bg-navy-50 p-2.5 rounded-xl">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span>{appointment.appointmentDate}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-primary-600" />
              <span>{appointment.startTime?.slice(0, 5)} - {appointment.endTime?.slice(0, 5)}</span>
            </div>
          </div>

          {appointment.reason && (
            <div className="flex items-start gap-2 text-xs text-navy-500 pt-1">
              <FileText className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-0.5" />
              <p className="line-clamp-1 italic">"{appointment.reason}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-navy-100 flex items-center justify-between gap-2">
        <Link
          to={role === 'PATIENT' ? `/patient/appointments/${appointment.id}` : `/doctor/appointments`}
          className="flex-1"
        >
          <Button variant="secondary" size="sm" fullWidth>
            Details
          </Button>
        </Link>

        {role === 'PATIENT' && appointment.status === 'PENDING' && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onCancel?.(appointment.id)}
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
}

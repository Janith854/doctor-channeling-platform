import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appointmentApi } from '../../api/bookingApi';
import { doctorApi, hospitalApi } from '../../api/directoryApi';
import { paymentApi } from '../../api/paymentApi';
import StatusBadge from '../../components/appointments/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import {
  Calendar,
  Clock,
  Building2,
  FileText,
  CreditCard,
  ArrowLeft,
  XCircle,
  CalendarCheck,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

function DetailBlock({ icon: Icon, label, children }) {
  return (
    <div className="p-4 bg-navy-50/60 border border-navy-100/60 rounded-xl space-y-1">
      <span className="text-xs font-semibold text-navy-400 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-primary-500" /> {label}
      </span>
      <div className="text-sm font-semibold text-navy-900">{children}</div>
    </div>
  );
}

function PaymentStatusIcon({ status }) {
  if (status === 'PAID') return <CheckCircle2 className="w-4 h-4 text-accent-500" />;
  if (status === 'FAILED') return <XCircle className="w-4 h-4 text-danger-500" />;
  return <AlertCircle className="w-4 h-4 text-warning-500" />;
}

export default function AppointmentDetails() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const apptRes = await appointmentApi.getById(id);
      const apptData = apptRes.data?.data;
      setAppointment(apptData);

      if (apptData?.doctorId) {
        const docRes = await doctorApi.getById(apptData.doctorId).catch(() => null);
        if (docRes?.data?.data) setDoctor(docRes.data.data);
      }

      if (apptData?.hospitalId) {
        const hospRes = await hospitalApi.getById(apptData.hospitalId).catch(() => null);
        if (hospRes?.data?.data) setHospital(hospRes.data.data);
      }

      const payRes = await paymentApi.getByAppointment(id).catch(() => null);
      if (payRes?.data?.data) setPayments(payRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await appointmentApi.cancel(id, { reason: 'Patient cancelled from details' });
      toast.success('Appointment cancelled');
      setCancelModal(false);
      fetchDetails();
    } catch (err) {
      toast.error('Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader text="Loading consultation details..." />;
  if (!appointment) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={CalendarCheck}
          title="Appointment not found"
          description="The requested appointment details could not be found."
          actionLabel="Back to Appointments"
          onAction={() => (window.location.href = '/patient/appointments')}
        />
      </div>
    );
  }

  const canCancel = appointment.status === 'PENDING' || appointment.status === 'CONFIRMED';
  const doctorName = doctor?.fullName || doctor?.name;
  const displayName = doctorName
    ? doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`
    : 'Doctor';
  const initial = (doctorName || 'D').replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link
        to="/patient/appointments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Appointments
      </Link>

      {/* Main card */}
      <div className="bg-white border border-navy-100 rounded-2xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-navy-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">
              Consultation Pass
            </span>
            <h1 className="text-xl font-bold text-navy-900 mt-1">
              Appointment #{appointment.appointmentNumber || appointment.id?.slice(0, 8)}
            </h1>
          </div>
          <StatusBadge status={appointment.status} className="self-start sm:self-auto" />
        </div>

        <div className="p-6 space-y-5">
          {/* Doctor info */}
          <div className="flex items-center gap-4 p-4 bg-primary-50/40 border border-primary-100/60 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 border border-primary-200/60 flex items-center justify-center text-lg font-bold shrink-0">
              {initial}
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider block">
                Assigned Specialist
              </span>
              <p className="font-bold text-navy-900 text-base">{displayName}</p>
              <p className="text-xs text-primary-700 font-medium mt-0.5">
                {doctor?.specialization?.name || 'General Physician'}
              </p>
            </div>
            <Stethoscope className="w-5 h-5 text-primary-300 ml-auto shrink-0" />
          </div>

          {/* Date & Time grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailBlock icon={Calendar} label="Date">
              {appointment.appointmentDate}
            </DetailBlock>
            <DetailBlock icon={Clock} label="Time">
              {appointment.startTime?.slice(0, 5)} – {appointment.endTime?.slice(0, 5)}
            </DetailBlock>
          </div>

          {/* Hospital */}
          {hospital && (
            <DetailBlock icon={Building2} label="Hospital">
              <span>{hospital.name}</span>
              {(hospital.address || hospital.city) && (
                <span className="block text-xs text-navy-500 font-normal mt-0.5">
                  {[hospital.address, hospital.city].filter(Boolean).join(', ')}
                </span>
              )}
            </DetailBlock>
          )}

          {/* Reason */}
          {appointment.reason && (
            <DetailBlock icon={FileText} label="Reason for Visit">
              {appointment.reason}
            </DetailBlock>
          )}

          {/* Payment section */}
          <div className="pt-1 border-t border-navy-100 space-y-3">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-600" /> Payment
            </h3>

            {payments.length > 0 ? (
              payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-accent-50/40 border border-accent-200/50 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <PaymentStatusIcon status={p.status} />
                    <div>
                      <p className="text-sm font-bold text-navy-900">
                        ${Number(p.amount).toFixed(2)} {p.currency || 'USD'}
                      </p>
                      <p className="text-[11px] text-navy-400 mt-0.5">
                        {p.paymentMethod} · {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))
            ) : (
              <p className="text-xs text-navy-500 p-3 bg-navy-50 rounded-xl border border-navy-100/60">
                Payment record settled online or registered at hospital counter.
              </p>
            )}
          </div>

          {/* Cancel action */}
          {canCancel && (
            <div className="pt-2 flex justify-end">
              <Button
                variant="danger"
                size="md"
                onClick={() => setCancelModal(true)}
                className="gap-2"
                id="btn-cancel-appointment"
              >
                <XCircle className="w-4 h-4" /> Cancel Appointment
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be reversed."
        confirmText="Yes, Cancel Appointment"
      />
    </div>
  );
}

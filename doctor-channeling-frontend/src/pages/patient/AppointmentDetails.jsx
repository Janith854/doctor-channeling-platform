import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appointmentApi } from '../../api/bookingApi';
import { doctorApi, hospitalApi } from '../../api/directoryApi';
import { paymentApi } from '../../api/paymentApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/appointments/StatusBadge';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Calendar,
  Clock,
  User,
  Building2,
  FileText,
  CreditCard,
  ArrowLeft,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

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

  if (loading) return <Loader text="Loading appointment details..." />;
  if (!appointment) return <div className="text-center py-12 text-navy-400">Appointment not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/patient/appointments" className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Appointments
      </Link>

      <Card className="bg-white border border-navy-100 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-100">
          <div>
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">Channeling Pass</span>
            <h1 className="text-2xl font-extrabold text-navy-900 mt-0.5">
              Appointment #{appointment.appointmentNumber || appointment.id?.slice(0, 8)}
            </h1>
          </div>
          <StatusBadge status={appointment.status} className="text-sm px-3 py-1 self-start sm:self-auto" />
        </div>

        {/* Schedule & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-navy-50 rounded-2xl space-y-1">
            <span className="text-xs text-navy-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary-600" /> Date
            </span>
            <p className="text-base font-extrabold text-navy-900">{appointment.appointmentDate}</p>
          </div>

          <div className="p-4 bg-navy-50 rounded-2xl space-y-1">
            <span className="text-xs text-navy-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-600" /> Time Slot
            </span>
            <p className="text-base font-extrabold text-navy-900">
              {appointment.startTime?.slice(0, 5)} - {appointment.endTime?.slice(0, 5)}
            </p>
          </div>
        </div>

        {/* Doctor & Hospital info */}
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-4 p-4 border border-navy-100 rounded-2xl">
            <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
              {doctor?.fullName?.charAt(0) || 'D'}
            </div>
            <div>
              <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider block">Assigned Doctor</span>
              <h4 className="font-bold text-navy-900 text-base">{doctor?.fullName || 'Dr. Specialist'}</h4>
              <p className="text-xs text-primary-600 font-semibold">{doctor?.specialization?.name || 'General Physician'}</p>
            </div>
          </div>

          {hospital && (
            <div className="flex items-start gap-4 p-4 border border-navy-100 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider block">Hospital Location</span>
                <h4 className="font-bold text-navy-900 text-base">{hospital.name}</h4>
                <p className="text-xs text-navy-500">{hospital.address}, {hospital.city}</p>
              </div>
            </div>
          )}

          {appointment.reason && (
            <div className="p-4 bg-navy-50 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-navy-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Reason for Visit
              </span>
              <p className="text-sm text-navy-800">{appointment.reason}</p>
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="pt-4 border-t border-navy-100 space-y-3">
          <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-accent-600" /> Payment Information
          </h3>
          {payments.length > 0 ? (
            payments.map((p) => (
              <div key={p.id} className="p-3 bg-accent-50/50 border border-accent-100 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-accent-800">Paid: ${p.amount} {p.currency}</span>
                  <span className="text-navy-400 block text-[10px]">{p.paymentMethod} • {new Date(p.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))
          ) : (
            <div className="p-3 bg-navy-50 rounded-xl text-xs text-navy-500">
              Payment record linked through channeling counter / online checkout.
            </div>
          )}
        </div>

        {/* Actions */}
        {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
          <div className="pt-4 border-t border-navy-100 flex justify-end">
            <Button
              variant="danger"
              size="md"
              onClick={() => setCancelModal(true)}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" /> Cancel Appointment
            </Button>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
      />
    </div>
  );
}

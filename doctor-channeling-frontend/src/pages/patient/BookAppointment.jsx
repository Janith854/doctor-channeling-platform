import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorApi, hospitalApi } from '../../api/directoryApi';
import { scheduleApi, slotApi } from '../../api/scheduleApi';
import { appointmentApi } from '../../api/bookingApi';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import PaymentSummary from '../../components/payments/PaymentSummary';
import PaymentForm from '../../components/payments/PaymentForm';
import {
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Check,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Doctor & Date' },
  { id: 2, label: 'Time Slot' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Payment' },
  { id: 5, label: 'Done' },
];

function StepIndicator({ step }) {
  return (
    <div className="flex items-center bg-white border border-navy-100 rounded-2xl p-4 shadow-xs overflow-x-auto">
      {STEPS.slice(0, 4).map((s, idx) => {
        const done = step > s.id;
        const active = step === s.id;
        return (
          <div key={s.id} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 min-w-0">
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  done
                    ? 'bg-accent-500 text-white'
                    : active
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-navy-100 text-navy-400'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : s.id}
              </span>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap ${
                  active ? 'text-primary-700' : done ? 'text-accent-600' : 'text-navy-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < 3 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                  step > s.id ? 'bg-accent-400' : 'bg-navy-100'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [doctorId, setDoctorId] = useState(preselectedDoctorId);
  const [hospitalId, setHospitalId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [createdAppointment, setCreatedAppointment] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [docRes, hospRes] = await Promise.all([
          doctorApi.getAll(),
          hospitalApi.getAll(),
        ]);
        setDoctors(docRes.data?.data || []);
        setHospitals(hospRes.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!doctorId) return;
    scheduleApi
      .getByDoctor(doctorId)
      .then((res) => {
        const data = res.data?.data || [];
        setSchedules(data);
        if (data.length > 0 && !hospitalId) {
          setHospitalId(data[0].hospitalId);
        }
      })
      .catch(console.error);
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId || !appointmentDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    slotApi
      .getAvailable(doctorId, appointmentDate)
      .then((res) => setAvailableSlots(res.data?.data || []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [doctorId, appointmentDate]);

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const selectedHospital = hospitals.find((h) => h.id === hospitalId);

  const handleBookingSubmit = async () => {
    if (!doctorId || !hospitalId || !appointmentDate || !selectedSlot) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        patientId: user.id,
        doctorId,
        hospitalId,
        slotId: selectedSlot.id,
        appointmentDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason,
      };
      const res = await appointmentApi.create(payload);
      setCreatedAppointment(res.data?.data);
      toast.success('Appointment reserved! Please complete payment.');
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      if (createdAppointment?.id) {
        await appointmentApi.confirm(createdAppointment.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStep(5);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Book an Appointment</h1>
        <p className="text-sm text-navy-500 mt-1">
          Follow the steps below to reserve your consultation slot.
        </p>
      </div>

      {step < 5 && <StepIndicator step={step} />}

      {/* ── STEP 1: Select Doctor & Date ── */}
      {step === 1 && (
        <div className="space-y-5 animate-slide-up">
          <div className="bg-white border border-navy-100 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-navy-100">
              <Stethoscope className="w-4 h-4 text-primary-600" />
              <h3 className="font-bold text-navy-900 text-sm">Select Doctor</h3>
            </div>
            <Select
              label="Doctor"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              options={doctors.map((d) => ({
                value: d.id,
                label: `${d.fullName || d.name} (${d.specialization?.name || 'General'})`,
              }))}
              placeholder="Choose a doctor"
              required
            />
          </div>

          <div className="bg-white border border-navy-100 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-navy-100">
              <Building2 className="w-4 h-4 text-primary-600" />
              <h3 className="font-bold text-navy-900 text-sm">Hospital & Date</h3>
            </div>
            <Select
              label="Hospital / Clinic"
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              options={hospitals.map((h) => ({ value: h.id, label: h.name }))}
              placeholder="Choose hospital"
              required
            />
            <Input
              label="Appointment Date"
              type="date"
              value={appointmentDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setStep(2)}
            disabled={!doctorId || !hospitalId || !appointmentDate}
          >
            Next: Choose Time Slot
          </Button>
        </div>
      )}

      {/* ── STEP 2: Select Time Slot ── */}
      {step === 2 && (
        <div className="space-y-5 animate-slide-up">
          <div className="bg-white border border-navy-100 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-navy-100">
              <Clock className="w-4 h-4 text-primary-600" />
              <h3 className="font-bold text-navy-900 text-sm">Available Time Slots</h3>
              <span className="ml-auto text-xs text-navy-400 font-medium">{appointmentDate}</span>
            </div>

            {slotsLoading ? (
              <Loader text="Loading available slots..." />
            ) : availableSlots.length === 0 ? (
              <div className="p-4 bg-warning-50 border border-warning-200/80 rounded-xl text-warning-800 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-warning-600" />
                <span>No open slots for this date. Please pick another date or doctor.</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                          : 'bg-white border-navy-200 text-navy-700 hover:border-primary-400 hover:bg-primary-50/40'
                      }`}
                    >
                      <div className="text-sm font-bold">{slot.startTime?.slice(0, 5)}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">
                        to {slot.endTime?.slice(0, 5)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <Input
              label="Reason for Consultation (Optional)"
              placeholder="e.g. Routine checkup, follow-up..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" size="lg" onClick={() => setStep(1)} className="flex-1">
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setStep(3)}
              disabled={!selectedSlot}
              className="flex-1"
            >
              Review Appointment
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Review ── */}
      {step === 3 && (
        <div className="space-y-5 animate-slide-up">
          <div className="bg-white border border-navy-100 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-navy-900 text-base border-b border-navy-100 pb-3">
              Review your appointment
            </h3>

            <div className="space-y-3">
              <ReviewRow icon={User} label="Doctor" value={selectedDoctor?.fullName || `Doctor #${doctorId?.slice(0,8)}`} />
              <ReviewRow icon={Stethoscope} label="Specialization" value={selectedDoctor?.specialization?.name || '—'} />
              <ReviewRow icon={Building2} label="Hospital" value={selectedHospital?.name || `Hospital #${hospitalId?.slice(0,8)}`} />
              <ReviewRow icon={Calendar} label="Date" value={appointmentDate} />
              <ReviewRow
                icon={Clock}
                label="Time"
                value={`${selectedSlot?.startTime?.slice(0, 5)} – ${selectedSlot?.endTime?.slice(0, 5)}`}
              />
              {reason && <ReviewRow icon={Clock} label="Reason" value={reason} />}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" size="lg" onClick={() => setStep(2)} className="flex-1">
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleBookingSubmit}
              loading={loading}
              className="flex-1"
            >
              Confirm & Pay
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Payment ── */}
      {step === 4 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-slide-up">
          <div className="space-y-4">
            <PaymentSummary doctorFee={20.0} hospitalFee={5.0} bookingFee={2.5} />
            <div className="bg-white border border-navy-100 rounded-xl p-4 text-xs text-navy-600 space-y-1.5">
              <p><span className="font-semibold text-navy-900">Doctor:</span> {selectedDoctor?.fullName}</p>
              <p><span className="font-semibold text-navy-900">Hospital:</span> {selectedHospital?.name}</p>
              <p>
                <span className="font-semibold text-navy-900">Time:</span>{' '}
                {appointmentDate} at {selectedSlot?.startTime?.slice(0, 5)}
              </p>
            </div>
          </div>

          <div className="bg-white border border-navy-100 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-navy-100">
              <CreditCard className="w-4 h-4 text-primary-600" />
              <h3 className="font-bold text-navy-900 text-sm">Payment Details</h3>
            </div>
            <PaymentForm
              amount={27.5}
              appointmentId={createdAppointment?.id}
              patientId={user.id}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setStep(3)}
            />
          </div>
        </div>
      )}

      {/* ── STEP 5: Success ── */}
      {step === 5 && (
        <div className="bg-white border border-navy-100 rounded-2xl p-10 text-center space-y-5 shadow-xs animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-accent-50 text-accent-600 border border-accent-200/60 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Appointment Booked!</h2>
            <p className="text-sm text-navy-500 mt-1.5 max-w-md mx-auto">
              Your consultation has been confirmed. We'll send you a reminder before your appointment.
            </p>
          </div>

          <div className="p-4 bg-navy-50 rounded-xl max-w-xs mx-auto text-left text-xs space-y-2 border border-navy-100">
            <p>
              <span className="text-navy-500 font-medium">Booking Ref:</span>{' '}
              <span className="font-bold text-navy-900">
                #{createdAppointment?.appointmentNumber || createdAppointment?.id?.slice(0, 8)}
              </span>
            </p>
            <p>
              <span className="text-navy-500 font-medium">Date & Time:</span>{' '}
              <span className="font-bold text-navy-900">
                {appointmentDate} at {selectedSlot?.startTime?.slice(0, 5)}
              </span>
            </p>
            <p>
              <span className="text-navy-500 font-medium">Doctor:</span>{' '}
              <span className="font-bold text-navy-900">{selectedDoctor?.fullName}</span>
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="secondary" size="md" onClick={() => navigate('/patient/appointments')}>
              My Appointments
            </Button>
            <Button variant="primary" size="md" onClick={() => navigate('/patient')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-navy-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-xs text-navy-500 font-semibold w-24 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-navy-900">{value}</span>
    </div>
  );
}

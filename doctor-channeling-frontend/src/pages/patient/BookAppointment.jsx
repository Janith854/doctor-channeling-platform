import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorApi, hospitalApi, affiliationApi } from '../../api/directoryApi';
import { scheduleApi, slotApi } from '../../api/scheduleApi';
import { appointmentApi } from '../../api/bookingApi';
import { paymentApi } from '../../api/paymentApi';
import Card from '../../components/common/Card';
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
  User,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const [step, setStep] = useState(1); // 1: Select details, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Form State
  const [doctorId, setDoctorId] = useState(preselectedDoctorId);
  const [hospitalId, setHospitalId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [createdAppointment, setCreatedAppointment] = useState(null);

  // Load Initial Directory Data
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

  // When Doctor is chosen, load doctor schedules
  useEffect(() => {
    if (!doctorId) return;
    scheduleApi.getByDoctor(doctorId)
      .then((res) => {
        const data = res.data?.data || [];
        setSchedules(data);
        if (data.length > 0 && !hospitalId) {
          setHospitalId(data[0].hospitalId);
        }
      })
      .catch(console.error);
  }, [doctorId]);

  // Load available slots when doctor and date change
  useEffect(() => {
    if (!doctorId || !appointmentDate) return;
    setLoading(true);
    slotApi.getAvailable(doctorId, appointmentDate)
      .then((res) => {
        setAvailableSlots(res.data?.data || []);
      })
      .catch(() => {
        // If no slot endpoint available, fallback
        setAvailableSlots([]);
      })
      .finally(() => setLoading(false));
  }, [doctorId, appointmentDate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId || !hospitalId || !appointmentDate || !selectedSlot) {
      toast.error('Please select doctor, hospital, date, and time slot');
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
      const appt = res.data?.data;
      setCreatedAppointment(appt);
      toast.success('Appointment reserved! Please complete payment.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Trigger appointment confirmation
      if (createdAppointment?.id) {
        await appointmentApi.confirm(createdAppointment.id);
      }
      setStep(3);
    } catch (err) {
      console.error(err);
      setStep(3);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const selectedHospital = hospitals.find((h) => h.id === hospitalId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">Book Doctor Appointment</h1>
        <p className="text-sm text-navy-500 mt-1">
          Reserve your preferred consultation slot and complete instant confirmation
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl border border-navy-100">
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-primary-600' : 'text-navy-400'}`}>
          <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">1</span>
          Select Slot
        </div>
        <div className="h-0.5 w-12 bg-navy-200" />
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-primary-600' : 'text-navy-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-100 text-primary-700' : 'bg-navy-100 text-navy-500'}`}>2</span>
          Payment
        </div>
        <div className="h-0.5 w-12 bg-navy-200" />
        <div className={`flex items-center gap-2 text-xs font-bold ${step === 3 ? 'text-accent-600' : 'text-navy-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 3 ? 'bg-accent-100 text-accent-700' : 'bg-navy-100 text-navy-500'}`}>3</span>
          Confirmed
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleBookingSubmit} className="space-y-6">
          <Card className="bg-white border border-navy-100 p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary-600" /> Select Doctor & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Doctor"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                options={doctors.map((d) => ({
                  value: d.id,
                  label: `${d.fullName} (${d.specialization?.name || 'General'})`,
                }))}
                placeholder="Choose Doctor"
                required
              />

              <Select
                label="Hospital / Clinic"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                options={hospitals.map((h) => ({ value: h.id, label: h.name }))}
                placeholder="Choose Hospital"
                required
              />
            </div>

            <div>
              <Input
                label="Appointment Date"
                type="date"
                value={appointmentDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>
          </Card>

          {/* Time Slot Selection */}
          <Card className="bg-white border border-navy-100 p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" /> Available Time Slots
            </h3>

            {loading ? (
              <Loader text="Loading slots for chosen date..." />
            ) : availableSlots.length === 0 ? (
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl text-warning-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                No open slots found for this date. Please pick another date or check doctor schedule.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20 scale-[1.02]'
                          : 'bg-white border-navy-200 text-navy-800 hover:border-primary-400 hover:bg-primary-50/50'
                      }`}
                    >
                      <div className="text-xs font-bold">{slot.startTime?.slice(0, 5)}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">to {slot.endTime?.slice(0, 5)}</div>
                    </button>
                  );
                })}
              </div>
            )}

            <div>
              <Input
                label="Reason for Visit (Optional)"
                placeholder="E.g., Routine checkup, recurring migraine..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </Card>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedSlot}
            loading={loading}
          >
            Proceed to Payment
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <PaymentSummary doctorFee={20.00} hospitalFee={5.00} bookingFee={2.50} />
            <div className="mt-4 p-4 bg-white rounded-2xl border border-navy-100 text-xs text-navy-600 space-y-1">
              <p><span className="font-bold">Doctor:</span> {selectedDoctor?.fullName}</p>
              <p><span className="font-bold">Hospital:</span> {selectedHospital?.name}</p>
              <p><span className="font-bold">Date:</span> {appointmentDate} at {selectedSlot?.startTime?.slice(0, 5)}</p>
            </div>
          </div>

          <Card className="bg-white border border-navy-100 p-6">
            <h3 className="font-bold text-navy-900 text-base mb-4">Complete Payment</h3>
            <PaymentForm
              amount={27.50}
              appointmentId={createdAppointment?.id}
              patientId={user.id}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setStep(1)}
            />
          </Card>
        </div>
      )}

      {step === 3 && (
        <Card className="bg-white border border-navy-100 p-8 text-center space-y-4 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-navy-900">Appointment Confirmed!</h2>
          <p className="text-sm text-navy-500 max-w-md mx-auto">
            Your appointment has been successfully scheduled and paid. A confirmation email and notification have been sent.
          </p>

          <div className="p-4 bg-navy-50 rounded-2xl max-w-sm mx-auto text-left text-xs space-y-1.5">
            <p><span className="font-semibold text-navy-500">Booking No:</span> <span className="font-bold text-navy-900">#{createdAppointment?.appointmentNumber || createdAppointment?.id?.slice(0, 8)}</span></p>
            <p><span className="font-semibold text-navy-500">Date & Time:</span> <span className="font-bold text-navy-900">{appointmentDate} @ {selectedSlot?.startTime?.slice(0, 5)}</span></p>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/patient/appointments')}>
              View My Appointments
            </Button>
            <Button variant="primary" onClick={() => navigate('/patient')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

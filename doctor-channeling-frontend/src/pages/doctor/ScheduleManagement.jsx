import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { scheduleApi, slotApi } from '../../api/scheduleApi';
import { hospitalApi, doctorApi } from '../../api/directoryApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Calendar,
  Clock,
  Plus,
  Zap,
  Power,
  Trash2,
  Building2,
  CalendarCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function ScheduleManagement() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);

  // Form State
  const [hospitalId, setHospitalId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  const fetchSchedules = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const docListRes = await doctorApi.getAll();
      const allDocs = docListRes.data?.data || [];
      const currentDoc = allDocs.find((d) => d.userId === user.id) || allDocs[0];
      setDoctorProfile(currentDoc);

      const docId = currentDoc?.id || user.id;

      const [schedRes, hospRes] = await Promise.all([
        scheduleApi.getByDoctor(docId),
        hospitalApi.getAll(),
      ]);

      setSchedules(schedRes.data?.data || []);
      setHospitals(hospRes.data?.data || []);
      if (hospRes.data?.data?.length > 0 && !hospitalId) {
        setHospitalId(hospRes.data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [user?.id]);

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!doctorProfile?.id || !hospitalId) {
      toast.error('Please ensure doctor profile and hospital are selected');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        doctorId: doctorProfile.id,
        hospitalId,
        dayOfWeek,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        slotDurationMinutes: Number(slotDurationMinutes),
      };

      await scheduleApi.create(payload);
      toast.success('Schedule created successfully');
      setIsCreateOpen(false);
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActivate = async (id, isActive) => {
    try {
      if (isActive) {
        await scheduleApi.deactivate(id);
        toast.success('Schedule deactivated');
      } else {
        await scheduleApi.activate(id);
        toast.success('Schedule activated');
      }
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to update schedule status');
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await scheduleApi.delete(id);
      toast.success('Schedule deleted');
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to delete schedule');
    }
  };

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    if (!selectedSchedule || !slotDate) return;
    try {
      setGenerating(true);
      await slotApi.generate({
        scheduleId: selectedSchedule.id,
        slotDate,
      });
      toast.success('Appointment slots generated successfully for ' + slotDate);
      setIsGenerateOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate slots');
    } finally {
      setGenerating(false);
    }
  };

  const hospitalMap = Object.fromEntries(hospitals.map((h) => [h.id, h.name]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Doctor Schedule Management</h1>
          <p className="text-sm text-navy-500 mt-1">Configure weekly hospital timetables and generate booking slots</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create New Schedule
        </Button>
      </div>

      {loading ? (
        <Loader text="Loading schedule configurations..." />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No regular schedules created"
          description="Create your weekly clinic schedules to allow patients to book appointment slots."
          actionLabel="Create Schedule"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schedules.map((sch) => (
            <Card key={sch.id} className="bg-white border border-navy-100 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-extrabold text-primary-700 bg-primary-50 px-3 py-1 rounded-xl">
                    {sch.dayOfWeek}
                  </span>
                  <button
                    onClick={() => handleToggleActivate(sch.id, sch.active)}
                    className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                      sch.active
                        ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                        : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                    }`}
                  >
                    <Power className="w-3 h-3" /> {sch.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-navy-800">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span>{sch.startTime?.slice(0, 5)} - {sch.endTime?.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-navy-600">
                    <Building2 className="w-4 h-4 text-navy-400" />
                    <span>{hospitalMap[sch.hospitalId] || `Hospital #${sch.hospitalId?.slice(0, 8)}`}</span>
                  </div>
                  <p className="text-xs text-navy-400">Slot Duration: {sch.slotDurationMinutes || 20} minutes</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-navy-100 flex items-center justify-between gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedSchedule(sch);
                    setIsGenerateOpen(true);
                  }}
                  className="flex-1 gap-1 text-xs"
                >
                  <Zap className="w-3.5 h-3.5" /> Generate Slots
                </Button>
                <button
                  onClick={() => handleDeleteSchedule(sch.id)}
                  className="p-2 text-danger-500 hover:bg-danger-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Schedule Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Weekly Schedule">
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <Select
            label="Hospital / Clinic"
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
            options={hospitals.map((h) => ({ value: h.id, label: h.name }))}
            placeholder="Select Hospital"
            required
          />

          <Select
            label="Day of Week"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            options={DAYS.map((d) => ({ value: d, label: d }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <Input
            label="Slot Duration (Minutes)"
            type="number"
            min={5}
            max={120}
            value={slotDurationMinutes}
            onChange={(e) => setSlotDurationMinutes(e.target.value)}
            required
          />

          <div className="flex gap-3 justify-end pt-3">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Create Schedule</Button>
          </div>
        </form>
      </Modal>

      {/* Generate Slots Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Daily Appointment Slots"
      >
        <form onSubmit={handleGenerateSlots} className="space-y-4">
          <p className="text-xs text-navy-500 leading-relaxed">
            Generate individual bookable channeling slots for <b>{selectedSchedule?.dayOfWeek}</b> between{' '}
            <b>{selectedSchedule?.startTime?.slice(0, 5)} - {selectedSchedule?.endTime?.slice(0, 5)}</b>.
          </p>

          <Input
            label="Target Calendar Date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
            required
          />

          <div className="flex gap-3 justify-end pt-3">
            <Button variant="secondary" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
            <Button variant="accent" type="submit" loading={generating} className="gap-2">
              <Zap className="w-4 h-4" /> Generate Slots
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

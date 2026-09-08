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
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Calendar,
  Clock,
  Plus,
  Zap,
  Power,
  Trash2,
  Building2,
  CheckCircle2,
  CalendarDays,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['ALL', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const FORM_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function ScheduleManagement() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('ALL');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
      const docListRes = await doctorApi.getAll().catch(() => ({ data: { data: [] } }));
      const allDocs = docListRes.data?.data || [];
      const currentDoc = allDocs.find((d) => d.userId === user.id) || allDocs[0];
      setDoctorProfile(currentDoc);

      const docId = currentDoc?.id || user.id;

      const [schedRes, hospRes] = await Promise.all([
        scheduleApi.getByDoctor(docId).catch(() => ({ data: { data: [] } })),
        hospitalApi.getAll().catch(() => ({ data: { data: [] } })),
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
      toast.error('Please ensure hospital is selected');
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
      toast.success('Timetable schedule created successfully');
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

  const handleDeleteSchedule = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await scheduleApi.delete(deleteId);
      toast.success('Schedule removed');
      setDeleteId(null);
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to delete schedule');
    } finally {
      setDeleting(false);
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
      toast.success(`Slots generated successfully for ${slotDate}`);
      setIsGenerateOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate slots');
    } finally {
      setGenerating(false);
    }
  };

  const hospitalMap = Object.fromEntries(hospitals.map((h) => [h.id, h.name]));

  const filteredSchedules = schedules.filter((sch) => {
    if (selectedDay === 'ALL') return true;
    return sch.dayOfWeek === selectedDay;
  });

  const activeCount = schedules.filter((s) => s.active).length;
  const totalHospitals = new Set(schedules.map((s) => s.hospitalId)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Channeling Schedule"
        subtitle="Configure weekly consultation timetables, hospital centers, and generate patient appointment slots"
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Timetable
          </Button>
        }
      />

      {/* Schedule Status & Legend Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-navy-100 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs text-navy-400 font-medium">Active Schedules</p>
            <p className="text-xl font-bold text-navy-900 mt-0.5">{activeCount} of {schedules.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-navy-100 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs text-navy-400 font-medium">Affiliated Hospitals</p>
            <p className="text-xl font-bold text-navy-900 mt-0.5">{totalHospitals}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-navy-100 flex flex-col justify-center space-y-1.5 shadow-2xs">
          <p className="text-xs text-navy-400 font-medium">Status Guide</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-accent-700">
              <span className="w-2 h-2 rounded-full bg-accent-500"></span> Available / Active
            </span>
            <span className="inline-flex items-center gap-1.5 text-navy-500">
              <span className="w-2 h-2 rounded-full bg-navy-300"></span> Inactive
            </span>
          </div>
        </div>
      </div>

      {/* Day Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedDay === d
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white text-navy-600 hover:bg-navy-50 hover:text-navy-900 border border-navy-100'
            }`}
          >
            {d === 'ALL' ? 'All Days' : d.slice(0, 3)}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader text="Loading schedule timetable..." />
      ) : filteredSchedules.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={selectedDay === 'ALL' ? 'No schedules configured yet' : `No schedules for ${selectedDay}`}
          description="Create recurring weekly time slots to allow patients to book appointments at your affiliated medical centers."
          actionLabel="Add Timetable"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((sch) => (
            <Card
              key={sch.id}
              className="bg-white border border-navy-100 p-5 flex flex-col justify-between hover:border-navy-200 transition-colors"
            >
              <div className="space-y-3.5">
                <div className="flex justify-between items-center pb-2.5 border-b border-navy-100">
                  <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-0.5 rounded-lg">
                    {sch.dayOfWeek}
                  </span>
                  <button
                    onClick={() => handleToggleActivate(sch.id, sch.active)}
                    className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
                      sch.active
                        ? 'bg-accent-50 text-accent-700 border-accent-200 hover:bg-accent-100'
                        : 'bg-navy-100 text-navy-600 border-navy-200 hover:bg-navy-200'
                    }`}
                  >
                    <Power className="w-3 h-3" /> {sch.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-navy-900">
                    <Clock className="w-4 h-4 text-primary-600 shrink-0" />
                    <span>
                      {sch.startTime?.slice(0, 5)} - {sch.endTime?.slice(0, 5)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-navy-600">
                    <Building2 className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                    <span className="truncate font-medium">
                      {hospitalMap[sch.hospitalId] || `Hospital Center #${sch.hospitalId?.slice(0, 6)}`}
                    </span>
                  </div>

                  <div className="bg-navy-50/70 p-2.5 rounded-xl border border-navy-100/60 text-xs text-navy-600 flex items-center justify-between">
                    <span>Slot Interval</span>
                    <span className="font-semibold text-navy-900">
                      {sch.slotDurationMinutes || 20} mins / patient
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-navy-100 flex items-center justify-between gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedSchedule(sch);
                    setIsGenerateOpen(true);
                  }}
                  className="flex-1 gap-1 text-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-primary-600" /> Generate Slots
                </Button>
                <button
                  onClick={() => setDeleteId(sch.id)}
                  className="p-2 text-navy-400 hover:text-danger-600 hover:bg-danger-50 rounded-xl transition-colors cursor-pointer"
                  aria-label="Delete schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Schedule Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Weekly Consultation Schedule"
        subtitle="Define recurring channeling day, operating hours, and hospital location"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <Select
            label="Hospital / Medical Center"
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
            options={hospitals.map((h) => ({ value: h.id, label: h.name }))}
            placeholder="Select Hospital Location"
            required
          />

          <Select
            label="Day of Week"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            options={FORM_DAYS.map((d) => ({ value: d, label: d }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Session Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="Session End Time"
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

          <div className="flex gap-2.5 justify-end pt-3 border-t border-navy-100">
            <Button variant="secondary" size="md" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submitting}>
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generate Slots Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Daily Channeling Slots"
        subtitle="Instantiate bookable patient consultation slots for a specific date"
      >
        <form onSubmit={handleGenerateSlots} className="space-y-4">
          <div className="bg-navy-50 p-3.5 rounded-xl border border-navy-100 space-y-1 text-xs">
            <p className="font-semibold text-navy-800">
              Timetable: {selectedSchedule?.dayOfWeek} ({selectedSchedule?.startTime?.slice(0, 5)} - {selectedSchedule?.endTime?.slice(0, 5)})
            </p>
            <p className="text-navy-500">
              Location: {hospitalMap[selectedSchedule?.hospitalId] || 'Hospital Center'}
            </p>
          </div>

          <Input
            label="Select Date to Generate Slots"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
            required
          />

          <div className="flex gap-2.5 justify-end pt-3 border-t border-navy-100">
            <Button variant="secondary" size="md" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={generating} className="gap-2">
              <Zap className="w-4 h-4" /> Generate Slots
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteSchedule}
        loading={deleting}
        title="Delete Schedule Timetable"
        message="Are you sure you want to remove this weekly schedule? Any existing appointments will remain recorded."
      />
    </div>
  );
}

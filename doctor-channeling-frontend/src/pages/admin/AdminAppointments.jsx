import { useState, useEffect } from 'react';
import { doctorApi, hospitalApi } from '../../api/directoryApi';
import { appointmentApi } from '../../api/bookingApi';
import Table from '../../components/common/Table';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/appointments/StatusBadge';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  Filter,
  Building2,
  Stethoscope,
  XCircle,
} from 'lucide-react';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [docRes, hospRes] = await Promise.all([
          doctorApi.getAll().catch(() => ({ data: { data: [] } })),
          hospitalApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);

        const docList = docRes.data?.data || [];
        setDoctors(docList);
        setHospitals(hospRes.data?.data || []);

        // Load appointments across doctors
        const apptPromises = docList.map((d) =>
          appointmentApi.getByDoctor(d.id).catch(() => ({ data: { data: [] } }))
        );
        const apptResults = await Promise.all(apptPromises);
        const allAppts = apptResults.flatMap((r) => r.data?.data || []);
        setAppointments(allAppts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const doctorMap = Object.fromEntries(doctors.map((d) => [d.id, d.fullName]));
  const hospitalMap = Object.fromEntries(hospitals.map((h) => [h.id, h.name]));

  // KPI calculations
  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length;

  // Filter logic
  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (doctorFilter !== 'ALL' && a.doctorId !== doctorFilter) return false;
    if (hospitalFilter !== 'ALL' && a.hospitalId !== hospitalFilter) return false;
    if (dateFilter && a.appointmentDate !== dateFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const numMatch = a.appointmentNumber?.toLowerCase().includes(q);
      const idMatch = a.patientId?.toLowerCase().includes(q) || a.id?.toLowerCase().includes(q);
      const docName = doctorMap[a.doctorId]?.toLowerCase() || '';
      if (!numMatch && !idMatch && !docName.includes(q)) return false;
    }

    return true;
  });

  const columns = [
    {
      key: 'appointmentNumber',
      label: 'Appt Ref',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-xs text-primary-700 block">
            #{row.appointmentNumber || row.id?.slice(0, 8)}
          </span>
          <span className="text-[10px] text-navy-400">Patient: #{row.patientId?.slice(0, 6)}</span>
        </div>
      ),
    },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (row) => (
        <span className="font-semibold text-xs text-navy-900 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-primary-600 shrink-0" />
          <span className="truncate max-w-[160px]">
            {doctorMap[row.doctorId] || `Dr. #${row.doctorId?.slice(0, 6)}`}
          </span>
        </span>
      ),
    },
    {
      key: 'hospital',
      label: 'Hospital / Facility',
      render: (row) => (
        <span className="text-xs text-navy-600 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-navy-400 shrink-0" />
          <span className="truncate max-w-[150px]">
            {hospitalMap[row.hospitalId] || `Hospital #${row.hospitalId?.slice(0, 6)}`}
          </span>
        </span>
      ),
    },
    {
      key: 'schedule',
      label: 'Date & Time',
      render: (row) => (
        <div className="text-xs text-navy-700">
          <span className="font-medium text-navy-900">{row.appointmentDate}</span>
          <span className="text-navy-400 mx-1.5">•</span>
          <span className="text-navy-600">{row.startTime?.slice(0, 5)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Booking Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointment Operations"
        subtitle="Cross-hospital channeling schedules, patient consultations, and live status tracking"
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          icon={ClipboardList}
          label="Total Bookings"
          value={appointments.length}
          description="All platform records"
          iconClassName="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Confirmation"
          value={pendingCount}
          description="Awaiting clinic validation"
          iconClassName="bg-warning-50 text-warning-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Confirmed & Active"
          value={confirmedCount}
          description="Ready for patient visit"
          iconClassName="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Visits"
          value={completedCount}
          description="Successfully channeled"
          iconClassName="bg-accent-50 text-accent-600"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-navy-100 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Query */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Search ref or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-navy-50/50 border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-navy-900 placeholder:text-navy-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-navy-50/50 border border-navy-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-navy-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Doctor Filter */}
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="text-xs bg-navy-50/50 border border-navy-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-navy-700 truncate"
          >
            <option value="ALL">All Doctors ({doctors.length})</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </select>

          {/* Hospital Filter */}
          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="text-xs bg-navy-50/50 border border-navy-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-navy-700 truncate"
          >
            <option value="ALL">All Hospitals ({hospitals.length})</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-navy-50/50 border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-navy-700"
            />
            {(searchQuery || statusFilter !== 'ALL' || doctorFilter !== 'ALL' || hospitalFilter !== 'ALL' || dateFilter) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-navy-500 hover:text-navy-900 shrink-0"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setDoctorFilter('ALL');
                  setHospitalFilter('ALL');
                  setDateFilter('');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <Loader text="Filtering platform appointments..." />
      ) : (
        <Table
          columns={columns}
          data={filteredAppointments}
          emptyTitle="No appointments match filters"
          emptyMessage="Adjust your date, doctor, or status filter to see appointments."
        />
      )}
    </div>
  );
}

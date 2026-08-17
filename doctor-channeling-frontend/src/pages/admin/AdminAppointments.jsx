import { useState, useEffect } from 'react';
import { doctorApi, hospitalApi } from '../../api/directoryApi';
import { appointmentApi } from '../../api/bookingApi';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/appointments/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { ClipboardList, Calendar, Clock, User } from 'lucide-react';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const columns = [
    {
      key: 'appointmentNumber',
      label: 'Appointment No.',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-primary-700">
          #{row.appointmentNumber || row.id?.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (row) => (
        <span className="font-semibold text-xs text-navy-900">
          {doctorMap[row.doctorId] || `Doctor #${row.doctorId?.slice(0, 6)}`}
        </span>
      ),
    },
    {
      key: 'hospital',
      label: 'Hospital',
      render: (row) => (
        <span className="text-xs text-navy-600">
          {hospitalMap[row.hospitalId] || `Hospital #${row.hospitalId?.slice(0, 6)}`}
        </span>
      ),
    },
    {
      key: 'schedule',
      label: 'Date & Time',
      render: (row) => (
        <div className="text-xs text-navy-700">
          <span className="font-medium">{row.appointmentDate}</span> •{' '}
          <span className="text-navy-500">{row.startTime?.slice(0, 5)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Platform Appointments</h1>
          <p className="text-sm text-navy-500 mt-1">Cross-system channeling appointments and consultation monitoring</p>
        </div>
      </div>

      {loading ? (
        <Loader text="Aggregating platform appointments..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No appointments registered yet"
          description="Platform channelings across all doctors will show up here."
        />
      ) : (
        <Table columns={columns} data={appointments} />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/bookingApi';
import { doctorApi } from '../../api/directoryApi';
import { userApi } from '../../api/authApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/appointments/StatusBadge';
import {
  Users,
  Search,
  User,
  Calendar,
  Clock,
  Phone,
  Mail,
  ChevronRight,
  ClipboardList,
  Activity,
} from 'lucide-react';

export default function DoctorPatients() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    async function loadPatientsData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const docListRes = await doctorApi.getAll().catch(() => ({ data: { data: [] } }));
        const allDocs = docListRes.data?.data || [];
        const currentDoc = allDocs.find((d) => d.userId === user.id) || allDocs[0];
        const docId = currentDoc?.id || user.id;

        const [appRes, usersRes] = await Promise.all([
          appointmentApi.getByDoctor(docId).catch(() => ({ data: { data: [] } })),
          userApi.getAllUsers().catch(() => ({ data: { data: [] } })),
        ]);

        const appts = appRes.data?.data || [];
        setAllAppointments(appts);

        const usersList = usersRes.data?.data || [];
        const userMap = Object.fromEntries(usersList.map((u) => [u.id, u]));

        // Group appointments by patientId
        const patientGroupMap = {};
        appts.forEach((appt) => {
          if (!appt.patientId) return;
          if (!patientGroupMap[appt.patientId]) {
            patientGroupMap[appt.patientId] = {
              id: appt.patientId,
              user: userMap[appt.patientId] || null,
              appointments: [],
            };
          }
          patientGroupMap[appt.patientId].appointments.push(appt);
        });

        // Compile patient list
        const patientArray = Object.values(patientGroupMap).map((item) => {
          const sorted = [...item.appointments].sort((a, b) =>
            b.appointmentDate > a.appointmentDate ? 1 : -1
          );
          const lastAppt = sorted[0];
          const completedCount = item.appointments.filter((a) => a.status === 'COMPLETED').length;

          const fullName = item.user
            ? `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim()
            : `Patient #${item.id.slice(0, 8)}`;

          return {
            id: item.id,
            name: fullName || `Patient #${item.id.slice(0, 8)}`,
            email: item.user?.email || 'N/A',
            phone: item.user?.phone || 'N/A',
            totalVisits: item.appointments.length,
            completedVisits: completedCount,
            lastAppointment: lastAppt?.appointmentDate || 'N/A',
            lastStatus: lastAppt?.status || 'PENDING',
            appointments: sorted,
          };
        });

        setPatients(patientArray);
      } catch (err) {
        console.error('Error loading patient list:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatientsData();
  }, [user?.id]);

  const filteredPatients = patients.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Directory"
        subtitle="Manage your patient records, consultation histories, and follow-up clinical profiles"
      />

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Search patient by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-navy-900 placeholder:text-navy-400 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center text-xs font-semibold text-navy-600 bg-white px-3.5 py-2 rounded-xl border border-navy-100 shadow-2xs">
          <Users className="w-4 h-4 text-primary-600" />
          <span>Total Patients Consulted: </span>
          <span className="text-primary-700 font-bold">{patients.length}</span>
        </div>
      </div>

      {loading ? (
        <Loader text="Compiling patient directory..." />
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery ? 'No patients match your search' : 'No patients on record'}
          description={
            searchQuery
              ? `No patient found matching "${searchQuery}". Try another name or ID.`
              : 'Patients who book appointments with you will automatically be registered in this directory.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="bg-white border border-navy-100 p-5 flex flex-col justify-between hover:border-navy-200 transition-all shadow-2xs"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 border border-primary-100 flex items-center justify-center font-bold text-sm shrink-0">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-900 text-sm">{patient.name}</h3>
                      <p className="text-[11px] font-mono text-navy-400">ID: #{patient.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <StatusBadge status={patient.lastStatus} />
                </div>

                <div className="space-y-2 text-xs text-navy-600 bg-navy-50/70 p-3 rounded-xl border border-navy-100/60">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                    <span>{patient.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-navy-100">
                    <p className="text-[11px] text-navy-400">Total Visits</p>
                    <p className="font-bold text-navy-900 mt-0.5">{patient.totalVisits} sessions</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-navy-100">
                    <p className="text-[11px] text-navy-400">Last Consultation</p>
                    <p className="font-bold text-navy-900 mt-0.5">{patient.lastAppointment}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-navy-100">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  className="gap-1.5 text-xs"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <Activity className="w-3.5 h-3.5 text-primary-600" /> View Consultation History
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Patient History Modal */}
      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={selectedPatient?.name || 'Patient Profile'}
        subtitle={`Patient Reference: #${selectedPatient?.id?.slice(0, 8)}`}
      >
        {selectedPatient && (
          <div className="space-y-5">
            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-navy-50/70 p-3.5 rounded-xl border border-navy-100 text-xs">
              <div>
                <p className="text-navy-400">Email Address</p>
                <p className="font-semibold text-navy-900 mt-0.5">{selectedPatient.email}</p>
              </div>
              <div>
                <p className="text-navy-400">Phone Contact</p>
                <p className="font-semibold text-navy-900 mt-0.5">{selectedPatient.phone}</p>
              </div>
            </div>

            {/* Visits History List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-500 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-primary-600" /> Channeling History (
                {selectedPatient.appointments.length})
              </h4>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {selectedPatient.appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-3 bg-white rounded-xl border border-navy-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900">{appt.appointmentDate}</span>
                        <span className="text-navy-400">•</span>
                        <span className="text-navy-600">{appt.startTime?.slice(0, 5)}</span>
                      </div>
                      {appt.reason && (
                        <p className="text-navy-500 italic line-clamp-1">"{appt.reason}"</p>
                      )}
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-navy-100">
              <Button variant="secondary" size="md" onClick={() => setSelectedPatient(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { userApi } from '../../api/authApi';
import { appointmentApi } from '../../api/bookingApi';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ClipboardList,
  Edit2,
  Trash2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editPatient, setEditPatient] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const userRes = await userApi.getAllUsers().catch(() => ({ data: { data: [] } }));
      const allUsers = userRes.data?.data || [];

      // Filter to patients (or users with ROLE_PATIENT or no role specified)
      const patientUsers = allUsers.filter(
        (u) => !u.role?.name || u.role.name === 'ROLE_PATIENT' || u.role.name === 'PATIENT'
      );

      // Fetch appointments for each patient to compute count
      const apptPromises = patientUsers.map((p) =>
        appointmentApi.getByPatient(p.id).catch(() => ({ data: { data: [] } }))
      );
      const apptResults = await Promise.all(apptPromises);

      const compiled = patientUsers.map((p, idx) => {
        const pAppts = apptResults[idx]?.data?.data || [];
        return {
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          fullName: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Anonymous Patient',
          email: p.email,
          phone: p.phone || 'N/A',
          registrationDate: p.createdAt ? p.createdAt.split('T')[0] : '2026-01-15',
          appointmentCount: pAppts.length,
          status: 'ACTIVE',
        };
      });

      setPatients(compiled);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patients list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editPatient) return;
    try {
      setSaving(true);
      await userApi.updateUser(editPatient.id, {
        firstName: editPatient.firstName,
        lastName: editPatient.lastName,
        email: editPatient.email,
        phone: editPatient.phone,
      });
      toast.success('Patient details updated');
      setEditPatient(null);
      fetchPatients();
    } catch (err) {
      toast.error('Failed to update patient');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSaving(true);
      await userApi.deleteUser(deleteId);
      toast.success('Patient account removed');
      setDeleteId(null);
      fetchPatients();
    } catch (err) {
      toast.error('Failed to delete patient account');
    } finally {
      setSaving(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'patient',
      label: 'Patient',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-bold flex items-center justify-center text-xs shrink-0">
            {row.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-navy-900 block text-xs">{row.fullName}</span>
            <span className="text-[11px] font-mono text-navy-400">ID: #{row.id?.slice(0, 8)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (row) => (
        <div className="text-xs space-y-0.5 text-navy-700">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-navy-400 shrink-0" />
            <span className="truncate max-w-[180px]">{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-navy-500">
            <Phone className="w-3.5 h-3.5 text-navy-400 shrink-0" />
            <span>{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'registrationDate',
      label: 'Registration Date',
      render: (row) => (
        <span className="text-xs text-navy-600 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-navy-400" />
          {row.registrationDate}
        </span>
      ),
    },
    {
      key: 'appointments',
      label: 'Bookings Count',
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
          <ClipboardList className="w-3 h-3" /> {row.appointmentCount} visits
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Account Status',
      render: () => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
          <UserCheck className="w-3 h-3" /> Active
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setEditPatient(row)}
            className="p-1.5 text-navy-500 hover:text-primary-600 hover:bg-navy-50 rounded-lg cursor-pointer transition-colors"
            title="Edit Patient"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 text-navy-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg cursor-pointer transition-colors"
            title="Delete Patient"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Accounts Management"
        subtitle="Manage registered patient profiles, contact credentials, appointment records, and account statuses"
      />

      {/* Search and Summary Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-navy-100 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Search patient name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-navy-50/50 border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-navy-900 placeholder:text-navy-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-navy-600">
          <span>Total Registered Patients: </span>
          <span className="font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
            {patients.length}
          </span>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading patient accounts..." />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table
              columns={columns}
              data={filteredPatients}
              emptyTitle="No patients found"
              emptyMessage="No patient accounts match your search filter."
            />
          </div>

          {/* Mobile Responsive Cards View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredPatients.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No patients found"
                description="Try searching with a different name or keyword."
              />
            ) : (
              filteredPatients.map((p) => (
                <Card key={p.id} className="bg-white border border-navy-100 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-bold flex items-center justify-center text-xs">
                        {p.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-navy-900 text-xs">{p.fullName}</h4>
                        <span className="text-[10px] font-mono text-navy-400">
                          #{p.id?.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
                      Active
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-navy-600 bg-navy-50/70 p-2.5 rounded-xl border border-navy-100/60">
                    <p className="truncate flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-navy-400" /> {p.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-navy-400" /> {p.phone}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-navy-500">
                      Bookings: <b>{p.appointmentCount}</b>
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        onClick={() => setEditPatient(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-danger-600 hover:bg-danger-50"
                        onClick={() => setDeleteId(p.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editPatient}
        onClose={() => setEditPatient(null)}
        title="Edit Patient Account"
        subtitle="Update patient contact information"
      >
        {editPatient && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={editPatient.firstName || ''}
                onChange={(e) => setEditPatient({ ...editPatient, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={editPatient.lastName || ''}
                onChange={(e) => setEditPatient({ ...editPatient, lastName: e.target.value })}
                required
              />
            </div>
            <Input
              label="Email Address"
              type="email"
              value={editPatient.email || ''}
              onChange={(e) => setEditPatient({ ...editPatient, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              value={editPatient.phone !== 'N/A' ? editPatient.phone : ''}
              onChange={(e) => setEditPatient({ ...editPatient, phone: e.target.value })}
              placeholder="+94 77 123 4567"
            />
            <div className="flex justify-end gap-2.5 pt-3 border-t border-navy-100">
              <Button variant="secondary" size="md" onClick={() => setEditPatient(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Patient Account"
        message="Are you sure you want to delete this patient account? System access and records will be affected."
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { doctorApi, specializationApi, hospitalApi, affiliationApi } from '../../api/directoryApi';
import { userApi } from '../../api/authApi';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Stethoscope,
  Building2,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [affiliations, setAffiliations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    specializationId: '',
    qualifications: '',
    slmcNumber: '',
    bio: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docRes, specRes, hospRes, affRes, userRes] = await Promise.allSettled([
        doctorApi.getAll(),
        specializationApi.getAll(),
        hospitalApi.getAll(),
        affiliationApi.getAll(),
        userApi.getAllUsers(),
      ]);

      setDoctors(docRes.status === 'fulfilled' ? docRes.value.data?.data || [] : []);
      setSpecializations(specRes.status === 'fulfilled' ? specRes.value.data?.data || [] : []);
      setHospitals(hospRes.status === 'fulfilled' ? hospRes.value.data?.data || [] : []);
      setAffiliations(affRes.status === 'fulfilled' ? affRes.value.data?.data || [] : []);
      setUsers(userRes.status === 'fulfilled' ? userRes.value.data?.data || [] : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctors directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditDoctor(null);
    setFormData({
      userId: users[0]?.id || '',
      fullName: '',
      specializationId: specializations[0]?.id || '',
      qualifications: '',
      slmcNumber: '',
      bio: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditDoctor(doc);
    setFormData({
      userId: doc.userId,
      fullName: doc.fullName,
      specializationId: doc.specialization?.id || doc.specializationId || '',
      qualifications: doc.qualifications || '',
      slmcNumber: doc.slmcNumber || '',
      bio: doc.bio || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editDoctor) {
        await doctorApi.update(editDoctor.id, formData);
        toast.success('Doctor details updated');
      } else {
        await doctorApi.create(formData);
        toast.success('Doctor registered into directory');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save doctor profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSaving(true);
      await doctorApi.delete(deleteId);
      toast.success('Doctor removed from directory');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete doctor');
    } finally {
      setSaving(false);
    }
  };

  // Hospital map
  const hospitalMap = Object.fromEntries(hospitals.map((h) => [h.id, h.name]));

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    if (selectedSpecialty !== 'ALL') {
      const specId = doc.specialization?.id || doc.specializationId;
      if (specId !== selectedSpecialty) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = doc.fullName?.toLowerCase().includes(q);
      const slmcMatch = doc.slmcNumber?.toLowerCase().includes(q);
      const specMatch = doc.specialization?.name?.toLowerCase().includes(q);
      if (!nameMatch && !slmcMatch && !specMatch) return false;
    }
    return true;
  });

  const columns = [
    {
      key: 'doctor',
      label: 'Doctor & SLMC',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 border border-primary-100 font-bold flex items-center justify-center text-xs shrink-0">
            {row.fullName?.charAt(0) || 'D'}
          </div>
          <div>
            <span className="font-bold text-navy-900 block text-xs">{row.fullName}</span>
            <span className="text-[11px] font-mono text-navy-400">
              SLMC: {row.slmcNumber || 'Unassigned'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      label: 'Clinical Specialty',
      render: (row) => (
        <span className="text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-lg inline-block">
          {row.specialization?.name || 'General Practitioner'}
        </span>
      ),
    },
    {
      key: 'hospital',
      label: 'Affiliated Centers',
      render: (row) => {
        const docAffs = affiliations.filter((a) => a.doctorId === row.id);
        if (docAffs.length === 0) {
          return <span className="text-xs text-navy-400 italic">No affiliations</span>;
        }
        const hospNames = docAffs
          .map((a) => hospitalMap[a.hospitalId] || 'Center')
          .slice(0, 2)
          .join(', ');
        return (
          <span className="text-xs text-navy-700 font-medium flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-navy-400 shrink-0" />
            <span className="truncate max-w-[180px]">{hospNames}</span>
            {docAffs.length > 2 && (
              <span className="text-[10px] text-navy-400">+{docAffs.length - 2}</span>
            )}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Directory Status',
      render: () => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
          <ShieldCheck className="w-3 h-3" /> Active
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
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-navy-500 hover:text-primary-600 hover:bg-navy-50 rounded-lg cursor-pointer transition-colors"
            title="Edit Doctor"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 text-navy-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg cursor-pointer transition-colors"
            title="Delete Doctor"
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
        title="Doctor Directory Management"
        subtitle="Maintain verified medical practitioners, specialties, credentials, and practice affiliations"
        actions={
          <Button variant="primary" size="md" onClick={handleOpenCreate} className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" /> Add Doctor
          </Button>
        }
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-navy-100 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Search doctor name or SLMC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-navy-50/50 border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-navy-900 placeholder:text-navy-400"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-navy-400 shrink-0" />
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="text-xs bg-navy-50/50 border border-navy-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-navy-700"
          >
            <option value="ALL">All Specializations ({specializations.length})</option>
            {specializations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <span className="text-xs text-navy-400 whitespace-nowrap pl-2">
            Showing <b>{filteredDoctors.length}</b> doctors
          </span>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading doctor directory..." />
      ) : (
        <Table
          columns={columns}
          data={filteredDoctors}
          emptyTitle="No doctors match criteria"
          emptyMessage="Try adjusting your specialty filter or search keyword."
        />
      )}

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editDoctor ? 'Edit Doctor Profile' : 'Register New Doctor'}
        subtitle="Manage credentials, clinical specialty, and biographical profile"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {!editDoctor && (
            <Select
              label="Linked User Account"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              options={users.map((u) => ({
                value: u.id,
                label: `${u.firstName} ${u.lastName} (${u.email})`,
              }))}
              required
            />
          )}

          <Input
            label="Full Name with Title"
            placeholder="Dr. Samantha Perera"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Select
            label="Medical Specialization"
            value={formData.specializationId}
            onChange={(e) => setFormData({ ...formData, specializationId: e.target.value })}
            options={specializations.map((s) => ({ value: s.id, label: s.name }))}
            required
          />

          <Input
            label="SLMC Registration Number"
            placeholder="SLMC-49201"
            value={formData.slmcNumber}
            onChange={(e) => setFormData({ ...formData, slmcNumber: e.target.value })}
          />

          <Input
            label="Qualifications"
            placeholder="MBBS, MD, FRCS"
            value={formData.qualifications}
            onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-navy-700 tracking-wide">
              Biography & Summary
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Clinical practice background and patient consultation expertise..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-navy-100">
            <Button variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={saving}>
              {editDoctor ? 'Save Changes' : 'Register Doctor'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={saving}
        title="Remove Doctor"
        message="Are you sure you want to remove this medical practitioner from the directory?"
        confirmText="Delete Doctor"
      />
    </div>
  );
}

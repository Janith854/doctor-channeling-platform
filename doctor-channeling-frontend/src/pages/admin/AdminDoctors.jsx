import { useState, useEffect } from 'react';
import { doctorApi, specializationApi } from '../../api/directoryApi';
import { userApi } from '../../api/authApi';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Stethoscope, Plus, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const [docRes, specRes, userRes] = await Promise.allSettled([
        doctorApi.getAll(),
        specializationApi.getAll(),
        userApi.getAllUsers(),
      ]);

      setDoctors(docRes.status === 'fulfilled' ? docRes.value.data?.data || [] : []);
      setSpecializations(specRes.status === 'fulfilled' ? specRes.value.data?.data || [] : []);
      setUsers(userRes.status === 'fulfilled' ? userRes.value.data?.data || [] : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctors list');
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
        toast.success('Doctor updated successfully');
      } else {
        await doctorApi.create(formData);
        toast.success('Doctor registered successfully');
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
      toast.success('Doctor deleted from directory');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete doctor');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Doctor Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary text-white font-bold flex items-center justify-center text-xs shrink-0">
            {row.fullName?.charAt(0) || 'D'}
          </div>
          <div>
            <span className="font-bold text-navy-900 block">{row.fullName}</span>
            <span className="text-[11px] text-navy-400">SLMC: {row.slmcNumber || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      label: 'Specialization',
      render: (row) => (
        <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg">
          {row.specialization?.name || 'General Practitioner'}
        </span>
      ),
    },
    {
      key: 'qualifications',
      label: 'Qualifications',
      render: (row) => <span className="text-xs text-navy-600 line-clamp-1">{row.qualifications || 'N/A'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-navy-500 hover:text-primary-600 hover:bg-navy-100 rounded-lg cursor-pointer transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 text-navy-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Doctor Directory Management</h1>
          <p className="text-sm text-navy-500 mt-1">Add, update, or unlist medical practitioners from the directory</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Doctor
        </Button>
      </div>

      {loading ? <Loader text="Loading directory doctors..." /> : <Table columns={columns} data={doctors} />}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editDoctor ? 'Edit Doctor Profile' : 'Register New Doctor'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {!editDoctor && (
            <Select
              label="Linked User Account"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              options={users.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.email})` }))}
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
            label="Specialization"
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

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">Biography & Summary</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Over 15 years of experience in cardiology..."
              className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>
              {editDoctor ? 'Save Changes' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Doctor Profile"
        message="Are you sure you want to delete this doctor from the directory?"
      />
    </div>
  );
}

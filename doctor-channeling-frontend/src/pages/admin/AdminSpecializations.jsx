import { useState, useEffect } from 'react';
import { specializationApi } from '../../api/directoryApi';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSpecializations() {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSpec, setEditSpec] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchSpecs = async () => {
    try {
      setLoading(true);
      const res = await specializationApi.getAll();
      setSpecializations(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load specializations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecs();
  }, []);

  const handleOpenCreate = () => {
    setEditSpec(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (spec) => {
    setEditSpec(spec);
    setFormData({ name: spec.name || '', description: spec.description || '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editSpec) {
        await specializationApi.update(editSpec.id, formData);
        toast.success('Specialization updated successfully');
      } else {
        await specializationApi.create(formData);
        toast.success('Specialization added successfully');
      }
      setIsModalOpen(false);
      fetchSpecs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save specialization');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSaving(true);
      await specializationApi.delete(deleteId);
      toast.success('Specialization removed');
      setDeleteId(null);
      fetchSpecs();
    } catch (err) {
      toast.error('Failed to delete specialization');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Specialty Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold text-xs shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-navy-900">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Clinical Description',
      render: (row) => (
        <span className="text-xs text-navy-600 line-clamp-1">
          {row.description || 'No description provided'}
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
            aria-label="Edit specialization"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 text-navy-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg cursor-pointer transition-colors"
            aria-label="Delete specialization"
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
        title="Medical Specializations"
        subtitle="Manage clinical specialties and department classifications"
        actions={
          <Button variant="primary" size="md" onClick={handleOpenCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Add Specialization
          </Button>
        }
      />

      {loading ? (
        <Loader text="Loading clinical specialties..." />
      ) : (
        <Table
          columns={columns}
          data={specializations}
          emptyTitle="No specializations registered"
          emptyMessage="Add the first medical specialty or clinical department."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editSpec ? 'Edit Specialization' : 'Add Medical Specialization'}
        subtitle="Specify specialty title and description"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Specialization Name"
            placeholder="Cardiology, Dermatology, Neurology..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-navy-700 tracking-wide">
              Clinical Description
            </label>
            <textarea
              rows={3}
              placeholder="Clinical discipline dealing with diagnosis and treatment of..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={saving}>
              {editSpec ? 'Save Changes' : 'Add Specialty'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Specialization"
        message="Are you sure you want to remove this medical specialization?"
      />
    </div>
  );
}

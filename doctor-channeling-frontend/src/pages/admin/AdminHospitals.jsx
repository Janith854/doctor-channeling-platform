import { useState, useEffect } from 'react';
import { hospitalApi } from '../../api/directoryApi';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Building2, Plus, Edit2, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editHospital, setEditHospital] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    district: '',
    phone: '',
    email: '',
  });

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await hospitalApi.getAll();
      setHospitals(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleOpenCreate = () => {
    setEditHospital(null);
    setFormData({ name: '', address: '', city: '', district: '', phone: '', email: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (hosp) => {
    setEditHospital(hosp);
    setFormData({
      name: hosp.name || '',
      address: hosp.address || '',
      city: hosp.city || '',
      district: hosp.district || '',
      phone: hosp.phone || '',
      email: hosp.email || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editHospital) {
        await hospitalApi.update(editHospital.id, formData);
        toast.success('Hospital updated');
      } else {
        await hospitalApi.create(formData);
        toast.success('Hospital registered');
      }
      setIsModalOpen(false);
      fetchHospitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save hospital');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSaving(true);
      await hospitalApi.delete(deleteId);
      toast.success('Hospital removed');
      setDeleteId(null);
      fetchHospitals();
    } catch (err) {
      toast.error('Failed to delete hospital');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Hospital Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-navy-900">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (row) => (
        <span className="text-xs text-navy-600 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-primary-500" /> {row.city || 'Colombo'}, {row.district || ''}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => <span className="text-xs text-navy-500">{row.phone || 'N/A'}</span>,
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
          <h1 className="text-2xl font-extrabold text-navy-900">Hospital Management</h1>
          <p className="text-sm text-navy-500 mt-1">Manage partnering hospitals, medical centers, and clinic locations</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Hospital
        </Button>
      </div>

      {loading ? <Loader text="Loading registered hospitals..." /> : <Table columns={columns} data={hospitals} />}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editHospital ? 'Edit Hospital Details' : 'Register New Hospital'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Hospital Name"
            placeholder="Asiri Central Hospital"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Address"
            placeholder="No. 114, Norris Canal Road"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              placeholder="Colombo 10"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="District"
              placeholder="Colombo"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone"
              placeholder="+94 11 452 4400"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Official Email"
              type="email"
              placeholder="info@hospital.lk"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>Save Hospital</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Hospital"
        message="Are you sure you want to remove this hospital?"
      />
    </div>
  );
}

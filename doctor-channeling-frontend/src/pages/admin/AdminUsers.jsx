import { useState, useEffect } from 'react';
import { userApi } from '../../api/authApi';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Users, Trash2, Edit2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAllUsers();
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      setSaving(true);
      await userApi.updateUser(editUser.id, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        phone: editUser.phone,
      });
      toast.success('User updated successfully');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSaving(true);
      await userApi.deleteUser(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Full Name',
      render: (row) => (
        <div className="font-bold text-navy-900">
          {row.firstName} {row.lastName}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email Address',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-navy-600">
          <Mail className="w-3.5 h-3.5 text-navy-400" /> {row.email}
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => (
        <span className="text-xs text-navy-500">{row.phone || 'N/A'}</span>
      ),
    },
    {
      key: 'role',
      label: 'System Role',
      render: (row) => (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
          {row.role?.name?.replace('ROLE_', '') || 'PATIENT'}
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
            onClick={() => setEditUser(row)}
            className="p-1.5 text-navy-500 hover:text-primary-600 hover:bg-navy-50 rounded-lg cursor-pointer transition-colors"
            aria-label="Edit user"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 text-navy-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg cursor-pointer transition-colors"
            aria-label="Delete user"
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
        title="User Accounts Management"
        subtitle="View, update, and manage all registered patient, doctor, and admin accounts"
      />

      {loading ? (
        <Loader text="Loading registered accounts..." />
      ) : (
        <Table
          columns={columns}
          data={users}
          emptyTitle="No accounts found"
          emptyMessage="No registered users exist in the identity registry."
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User Account"
        subtitle="Modify user contact information"
      >
        {editUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={editUser.firstName || ''}
                onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={editUser.lastName || ''}
                onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                required
              />
            </div>
            <Input
              label="Email Address"
              type="email"
              value={editUser.email || ''}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              value={editUser.phone || ''}
              onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
            />
            <div className="flex justify-end gap-2.5 pt-3">
              <Button variant="secondary" size="md" onClick={() => setEditUser(null)}>
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
        title="Delete User Account"
        message="Are you sure you want to permanently delete this user account? This will revoke system access."
      />
    </div>
  );
}

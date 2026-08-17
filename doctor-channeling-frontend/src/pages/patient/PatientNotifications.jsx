import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../api/notificationApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { Bell, Mail, CheckCircle2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await notificationApi.getByUser(user.id);
      setNotifications(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      toast.success('Notification removed');
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      toast.error('Failed to remove notification');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Notifications & Alerts</h1>
          <p className="text-sm text-navy-500 mt-1">Stay updated with your doctor appointments and payments</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchNotifications} className="text-xs">
          Refresh
        </Button>
      </div>

      {loading ? (
        <Loader text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You don't have any pending alerts or notifications at this moment."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className="bg-white border border-navy-100 p-5 flex items-start gap-4 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-navy-900">{n.subject || 'System Notification'}</h4>
                  <Badge status={n.status} />
                </div>
                <p className="text-xs text-navy-600 mt-1 leading-relaxed">{n.message || n.body}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-navy-100/60 text-[11px] text-navy-400">
                  <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Recent'}</span>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-danger-500 hover:text-danger-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

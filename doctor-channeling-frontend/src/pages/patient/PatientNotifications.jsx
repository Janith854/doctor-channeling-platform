import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../api/notificationApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { Bell, Mail, Trash2, RotateCw, CheckCheck, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

function getDateGroup(dateStr) {
  if (!dateStr) return 'Earlier';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return 'Earlier';
}

function groupNotifications(notifications) {
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  notifications.forEach((n) => {
    const group = getDateGroup(n.createdAt);
    groups[group].push(n);
  });
  return groups;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

const isUnread = (n) => n.status === 'PENDING' || !n.readAt;

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

  const unreadCount = notifications.filter(isUnread).length;
  const grouped = groupNotifications(notifications);
  const groupOrder = ['Today', 'Yesterday', 'Earlier'];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Notifications</h1>
          <p className="text-sm text-navy-500 mt-1">
            Stay updated with your appointments and health alerts
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold border border-primary-200/60">
              {unreadCount} new
            </span>
          )}
          <button
            id="btn-refresh-notifications"
            onClick={fetchNotifications}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-navy-200 text-navy-600 hover:border-navy-300 hover:text-navy-900 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-navy-100 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-accent-50 text-accent-500 border border-accent-100 flex items-center justify-center mx-auto">
            <CheckCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="font-bold text-navy-800 text-base">All caught up!</p>
            <p className="text-xs text-navy-400 mt-1">
              You don't have any notifications at the moment.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groupOrder.map((group) => {
            const items = grouped[group];
            if (!items || items.length === 0) return null;
            return (
              <div key={group} className="space-y-2">
                {/* Group label */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-navy-400" />
                  <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">
                    {group}
                  </span>
                </div>

                {/* Notification items */}
                <div className="space-y-2">
                  {items.map((n) => {
                    const unread = isUnread(n);
                    return (
                      <div
                        key={n.id}
                        className={`bg-white border rounded-2xl p-4 flex items-start gap-3.5 transition-all shadow-xs ${
                          unread
                            ? 'border-primary-200/60 border-l-4 border-l-primary-500'
                            : 'border-navy-100 hover:border-navy-200'
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            unread
                              ? 'bg-primary-50 text-primary-600'
                              : 'bg-navy-50 text-navy-400'
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-bold truncate ${unread ? 'text-navy-900' : 'text-navy-700'}`}>
                              {n.subject || 'System Notification'}
                            </h4>
                            <span className="text-[11px] text-navy-400 shrink-0">
                              {formatRelative(n.createdAt)}
                            </span>
                          </div>

                          {(n.message || n.body) && (
                            <p className="text-xs text-navy-500 mt-1 leading-relaxed line-clamp-2">
                              {n.message || n.body}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2.5">
                            {unread && (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-primary-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 inline-block" />
                                Unread
                              </span>
                            )}
                            <button
                              onClick={() => handleDelete(n.id)}
                              id={`btn-delete-notif-${n.id}`}
                              className="flex items-center gap-1 text-[11px] font-semibold text-danger-500 hover:text-danger-600 ml-auto cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

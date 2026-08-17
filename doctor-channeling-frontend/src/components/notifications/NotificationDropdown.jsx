import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, Mail } from 'lucide-react';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

export default function NotificationDropdown({ notifications = [], loading, onClose, onRefresh }) {
  const { getRolePath } = useAuth();
  const basePath = getRolePath();

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-navy-100 p-4 z-50 animate-slide-down">
      <div className="flex items-center justify-between pb-3 border-b border-navy-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-600" />
          <h4 className="font-bold text-sm text-navy-900">Notifications</h4>
          <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full">
            {notifications.length}
          </span>
        </div>
        <Link
          to={`${basePath}/notifications`}
          onClick={onClose}
          className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
        >
          View all <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="py-2 max-h-72 overflow-y-auto space-y-2">
        {loading ? (
          <div className="py-8 text-center text-xs text-navy-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-navy-400">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl hover:bg-navy-50 transition-colors border border-transparent hover:border-navy-100"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-navy-800 line-clamp-1">{item.subject || 'System Notification'}</p>
                <Badge status={item.status} className="scale-75 origin-right" />
              </div>
              <p className="text-xs text-navy-500 mt-1 line-clamp-2">{item.message || item.body}</p>
              <span className="text-[10px] text-navy-400 mt-1.5 block">
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t border-navy-100 text-center">
        <Link
          to={`${basePath}/notifications`}
          onClick={onClose}
          className="text-xs font-semibold text-primary-600 hover:underline block py-1"
        >
          See All Activity
        </Link>
      </div>
    </div>
  );
}

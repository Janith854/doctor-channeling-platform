import { clsx } from 'clsx';

const statusStyles = {
  PENDING: 'bg-warning-100 text-warning-600 border-warning-400/30',
  CONFIRMED: 'bg-accent-100 text-accent-700 border-accent-400/30',
  CANCELLED: 'bg-danger-100 text-danger-600 border-danger-400/30',
  COMPLETED: 'bg-primary-100 text-primary-700 border-primary-400/30',
  NO_SHOW: 'bg-navy-100 text-navy-600 border-navy-300/30',
  RESCHEDULED: 'bg-purple-100 text-purple-700 border-purple-400/30',
  PAID: 'bg-accent-100 text-accent-700 border-accent-400/30',
  FAILED: 'bg-danger-100 text-danger-600 border-danger-400/30',
  REFUNDED: 'bg-navy-100 text-navy-600 border-navy-300/30',
  SENT: 'bg-primary-100 text-primary-700 border-primary-400/30',
  ACTIVE: 'bg-accent-100 text-accent-700 border-accent-400/30',
  INACTIVE: 'bg-navy-100 text-navy-500 border-navy-300/30',
  AVAILABLE: 'bg-accent-100 text-accent-700 border-accent-400/30',
  BOOKED: 'bg-primary-100 text-primary-700 border-primary-400/30',
  default: 'bg-navy-100 text-navy-600 border-navy-300/30',
};

export default function Badge({ status, className = '', children }) {
  const text = children || status;
  const style = statusStyles[status] || statusStyles.default;

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        style,
        className
      )}
    >
      {text?.replace(/_/g, ' ')}
    </span>
  );
}

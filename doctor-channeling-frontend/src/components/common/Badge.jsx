import { clsx } from 'clsx';

const statusStyles = {
  // Booking & Appointment statuses
  PENDING: 'bg-warning-50 text-warning-700 border-warning-200/80',
  CONFIRMED: 'bg-primary-50 text-primary-700 border-primary-200/80',
  COMPLETED: 'bg-accent-50 text-accent-700 border-accent-200/80',
  CANCELLED: 'bg-danger-50 text-danger-700 border-danger-200/80',
  NO_SHOW: 'bg-navy-100 text-navy-600 border-navy-200',
  RESCHEDULED: 'bg-purple-50 text-purple-700 border-purple-200/80',

  // Payment statuses
  PAID: 'bg-accent-50 text-accent-700 border-accent-200/80',
  UNPAID: 'bg-warning-50 text-warning-700 border-warning-200/80',
  FAILED: 'bg-danger-50 text-danger-700 border-danger-200/80',
  REFUNDED: 'bg-navy-100 text-navy-600 border-navy-200',

  // General statuses
  ACTIVE: 'bg-accent-50 text-accent-700 border-accent-200/80',
  INACTIVE: 'bg-navy-100 text-navy-500 border-navy-200',
  AVAILABLE: 'bg-accent-50 text-accent-700 border-accent-200/80',
  BOOKED: 'bg-primary-50 text-primary-700 border-primary-200/80',
  SENT: 'bg-primary-50 text-primary-700 border-primary-200/80',

  default: 'bg-navy-100 text-navy-700 border-navy-200',
};

const dotColors = {
  PENDING: 'bg-warning-500',
  CONFIRMED: 'bg-primary-500',
  COMPLETED: 'bg-accent-500',
  CANCELLED: 'bg-danger-500',
  PAID: 'bg-accent-500',
  UNPAID: 'bg-warning-500',
  ACTIVE: 'bg-accent-500',
  INACTIVE: 'bg-navy-400',
  default: 'bg-navy-400',
};

export default function Badge({
  status,
  className = '',
  children,
  showDot = false,
}) {
  const text = children || status;
  const normalized = (status || '').toUpperCase();
  const style = statusStyles[normalized] || statusStyles.default;
  const dotColor = dotColors[normalized] || dotColors.default;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide select-none',
        style,
        className
      )}
    >
      {showDot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColor)} />}
      {text ? String(text).replace(/_/g, ' ') : ''}
    </span>
  );
}

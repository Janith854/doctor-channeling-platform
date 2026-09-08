import { Inbox } from 'lucide-react';
import Button from './Button';
import { clsx } from 'clsx';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = '',
  actionLabel = '',
  onAction,
  className = '',
  iconClassName = 'text-primary-600 bg-primary-50',
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-navy-200 bg-white/60 animate-fade-in',
        className
      )}
    >
      <div
        className={clsx(
          'w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5 shadow-xs',
          iconClassName
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-navy-900 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-navy-400 max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

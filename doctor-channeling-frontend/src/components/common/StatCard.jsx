import { clsx } from 'clsx';
import Card from './Card';

export default function StatCard({
  icon: Icon,
  label,
  value,
  description,
  trend,
  className = '',
  iconClassName = 'text-primary-600 bg-primary-50',
}) {
  return (
    <Card
      className={clsx(
        'p-5 bg-white border border-navy-100 shadow-xs hover:border-navy-200 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-navy-900">
              {value}
            </span>
            {trend && (
              <span className="text-xs font-medium text-accent-600">
                {trend}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-navy-400 truncate">
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={clsx(
              'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
              iconClassName
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}

import { clsx } from 'clsx';

export default function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  className = '',
}) {
  return (
    <div
      className={clsx(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            {title}
          </h1>
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-navy-500 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

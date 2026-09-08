import { clsx } from 'clsx';
import EmptyState from './EmptyState';
import { Database } from 'lucide-react';

export default function Table({
  columns,
  data,
  onRowClick,
  emptyTitle = 'No records found',
  emptyMessage = 'No data available to display in this table.',
  emptyActionLabel,
  onEmptyAction,
  className = '',
}) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title={emptyTitle}
        description={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        className="my-4"
      />
    );
  }

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-xs',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50/70 text-navy-600">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap',
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'transition-colors duration-150',
                  'hover:bg-primary-50/20',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx('px-4 py-3.5 text-navy-700 text-xs sm:text-sm', col.className)}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

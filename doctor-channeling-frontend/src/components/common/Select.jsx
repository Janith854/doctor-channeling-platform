import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Select = forwardRef(function Select(
  {
    label,
    error,
    options = [],
    placeholder = 'Select...',
    className = '',
    id,
    name,
    onChange,
    onBlur,
    ...props
  },
  ref
) {
  const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-navy-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        className={clsx(
          'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-navy-900',
          'transition-all duration-200 appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
          'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10',
          error
            ? 'border-danger-400 focus:ring-danger-500/30 focus:border-danger-500'
            : 'border-navy-200 hover:border-navy-300'
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  );
});

export default Select;

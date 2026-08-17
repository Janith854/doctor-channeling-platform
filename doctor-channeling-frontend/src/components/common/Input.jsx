import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    icon: Icon,
    placeholder = '',
    error,
    name,
    onChange,
    onBlur,
    id,
    className = '',
    ...props
  },
  ref
) {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          className={clsx(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
            Icon && 'pl-10',
            error
              ? 'border-danger-400 focus:ring-danger-500/30 focus:border-danger-500'
              : 'border-navy-200 hover:border-navy-300'
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  );
});

export default Input;

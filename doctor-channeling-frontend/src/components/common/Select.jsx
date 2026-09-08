import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    placeholder = 'Select an option...',
    className = '',
    id,
    name,
    onChange,
    onBlur,
    required = false,
    disabled = false,
    ...props
  },
  ref
) {
  const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-navy-700 tracking-wide"
        >
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          className={clsx(
            'w-full h-10 rounded-xl border bg-white pl-3.5 pr-10 text-sm text-navy-900',
            'transition-all duration-150 appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            'disabled:bg-navy-50 disabled:text-navy-400 disabled:cursor-not-allowed',
            error
              ? 'border-danger-400 focus:ring-danger-500/20 focus:border-danger-500'
              : 'border-navy-200 hover:border-navy-300'
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="text-xs text-danger-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-navy-400">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;

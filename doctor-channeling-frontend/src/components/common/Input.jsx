import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    icon: Icon,
    placeholder = '',
    error,
    helperText,
    name,
    onChange,
    onBlur,
    id,
    className = '',
    required = false,
    disabled = false,
    ...props
  },
  ref
) {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-navy-700 tracking-wide"
        >
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          className={clsx(
            'w-full h-10 rounded-xl border bg-white px-3.5 text-sm text-navy-900 placeholder:text-navy-400',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            'disabled:bg-navy-50 disabled:text-navy-400 disabled:cursor-not-allowed',
            Icon && 'pl-10',
            error
              ? 'border-danger-400 focus:ring-danger-500/20 focus:border-danger-500'
              : 'border-navy-200 hover:border-navy-300'
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-danger-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-navy-400">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;

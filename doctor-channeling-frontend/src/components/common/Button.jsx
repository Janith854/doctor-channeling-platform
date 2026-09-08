import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-xs focus-visible:ring-primary-500/40',
  secondary:
    'bg-white hover:bg-navy-50 active:bg-navy-100 text-navy-700 border border-navy-200 hover:border-navy-300 shadow-xs focus-visible:ring-navy-300/40',
  danger:
    'bg-danger-600 hover:bg-danger-700 active:bg-danger-800 text-white shadow-xs focus-visible:ring-danger-500/40',
  success:
    'bg-accent-600 hover:bg-accent-700 active:bg-accent-800 text-white shadow-xs focus-visible:ring-accent-500/40',
  accent:
    'bg-accent-600 hover:bg-accent-700 active:bg-accent-800 text-white shadow-xs focus-visible:ring-accent-500/40',
  ghost:
    'bg-transparent hover:bg-navy-100/70 text-navy-600 hover:text-navy-900 focus-visible:ring-navy-300/40',
  outline:
    'bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500/40',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2.5 font-semibold',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}

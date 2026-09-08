import { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  className = '',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />
      <div
        className={clsx(
          'relative w-full bg-white rounded-2xl shadow-xl border border-navy-100 animate-scale-in',
          'max-h-[90vh] flex flex-col',
          sizes[size] || sizes.md,
          className
        )}
      >
        {title && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-navy-100">
            <div>
              <h2 className="text-base font-bold text-navy-900">{title}</h2>
              {subtitle && (
                <p className="text-xs text-navy-400 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-navy-100/70 transition-colors text-navy-400 hover:text-navy-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

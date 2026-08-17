import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

export default function ErrorMessage({ message, onRetry, dismissible = true, className = '' }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !message) return null;

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 animate-slide-down',
        className
      )}
    >
      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-danger-600 hover:text-danger-800 underline cursor-pointer"
          >
            Try again
          </button>
        )}
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-danger-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

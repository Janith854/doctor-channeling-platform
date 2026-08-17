import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Loader({ fullScreen = false, size = 'md', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary-400/20 animate-ping" />
          <Loader2 className={clsx(sizes.lg, 'animate-spin text-primary-600 relative')} />
        </div>
        {text && <p className="mt-4 text-sm text-navy-500 font-medium">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={clsx(sizes[size], 'animate-spin text-primary-500')} />
      {text && <p className="mt-3 text-sm text-navy-400">{text}</p>}
    </div>
  );
}

export function SkeletonLine({ className = '' }) {
  return <div className={clsx('skeleton h-4', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-navy-100 p-6 space-y-4">
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-8 w-20 rounded-full" />
        <div className="skeleton h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

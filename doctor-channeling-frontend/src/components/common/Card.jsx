import { clsx } from 'clsx';

export default function Card({
  children,
  className = '',
  glass = false,
  hover = false,
  padding = 'p-5 sm:p-6',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl transition-all duration-200',
        glass
          ? 'glass'
          : 'bg-white border border-navy-100 shadow-xs',
        hover && 'hover:shadow-md hover:border-navy-200 hover:-translate-y-0.5 cursor-pointer',
        padding,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

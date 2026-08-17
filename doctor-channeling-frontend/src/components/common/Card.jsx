import { clsx } from 'clsx';

export default function Card({
  children,
  className = '',
  glass = false,
  hover = false,
  padding = 'p-6',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl transition-all duration-300',
        glass
          ? 'glass'
          : 'bg-white border border-navy-100 shadow-sm',
        hover && 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
        padding,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

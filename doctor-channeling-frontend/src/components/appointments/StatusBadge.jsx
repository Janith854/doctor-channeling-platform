import Badge from '../common/Badge';

export default function StatusBadge({ status, className = '', showDot = true }) {
  return <Badge status={status} className={className} showDot={showDot} />;
}

import Badge from '../common/Badge';

export default function StatusBadge({ status, className = '' }) {
  return <Badge status={status} className={className} />;
}

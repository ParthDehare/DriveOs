export default function StatusBadge({ status, size = 'md' }) {
  if (!status) return null;

  const normalized = status.toLowerCase();
  let colorClass = 'badge-info';

  if (['active', 'completed', 'paid', 'passed', 'valid'].includes(normalized)) {
    colorClass = 'badge-success';
  } else if (['scheduled', 'pending', 'ongoing'].includes(normalized)) {
    colorClass = 'badge-info';
  } else if (['suspended', 'overdue', 'failed', 'no_show', 'cancelled', 'expired'].includes(normalized)) {
    colorClass = 'badge-danger';
  } else if (['maintenance', 'inactive', 'expiring_soon'].includes(normalized)) {
    colorClass = 'badge-warning';
  }

  const padding = size === 'sm' ? '2px 6px' : '4px 10px';
  const fontSize = size === 'sm' ? '0.65rem' : '0.75rem';

  return (
    <span className={`badge ${colorClass}`} style={{ padding, fontSize }}>
      {status.replace('_', ' ')}
    </span>
  );
}

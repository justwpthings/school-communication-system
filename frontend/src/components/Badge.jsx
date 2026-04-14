import { cn } from '../utils/cn';

const styles = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-danger/10 text-danger',
  needs_revision: 'bg-accentSoft text-accent'
};

export const Badge = ({ children, tone = 'pending', className }) => (
  <span
    className={cn(
      'inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize',
      styles[tone] || 'bg-black/5 text-muted',
      className
    )}
  >
    {String(children).replace('_', ' ')}
  </span>
);

import { cn } from '../utils/cn';

export const Card = ({ className, children }) => (
  <div className={cn('rounded-3xl bg-card p-6 shadow-card ring-1 ring-black/[0.03]', className)}>
    {children}
  </div>
);

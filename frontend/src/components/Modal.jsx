import { Button } from './Button';
import { cn } from '../utils/cn';

export const Modal = ({ open, title, description, children, onClose, footer, size = 'md' }) => {
  if (!open) {
    return null;
  }

  const widths = {
    sm: 'max-w-lg',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6 backdrop-blur-sm animate-fadeIn">
      <div
        className={cn(
          'w-full rounded-[28px] bg-white p-6 shadow-card ring-1 ring-black/5 animate-popIn',
          widths[size]
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-ink">{title}</h3>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <Button variant="ghost" className="px-3 py-2" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="space-y-5">{children}</div>
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
};

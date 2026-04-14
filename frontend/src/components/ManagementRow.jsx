import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

export const ManagementRow = ({
  title,
  subtitle,
  meta = [],
  status,
  actionLabel,
  actionVariant = 'secondary',
  onAction,
  actionDisabled = false
}) => (
  <Card className="p-5 transition duration-200 hover:-translate-y-[1px] hover:shadow-soft">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
          {status ? <Badge tone={status}>{status}</Badge> : null}
        </div>
        {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
        {meta.length ? (
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
            {meta.filter(Boolean).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}
      </div>

      {actionLabel ? (
        <Button
          variant={actionVariant}
          className="sm:self-start"
          onClick={onAction}
          disabled={actionDisabled}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  </Card>
);

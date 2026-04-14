import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Just now';

export const NotificationCard = ({
  notification,
  actions,
  compact = false,
  onOpen
}) => (
  <Card className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={notification.status}>{notification.status}</Badge>
          {notification.category_name ? <Badge tone="needs_revision">{notification.category_name}</Badge> : null}
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-ink">{notification.title}</h3>
        <p className="max-w-2xl text-sm leading-6 text-muted">
          {compact ? `${notification.message.slice(0, 140)}${notification.message.length > 140 ? '…' : ''}` : notification.message}
        </p>
      </div>
      <p className="text-sm text-muted">{formatDate(notification.updated_at || notification.created_at)}</p>
    </div>

    <div className="flex flex-wrap gap-2 text-sm text-muted">
      {notification.class_name ? <span>{notification.class_name} {notification.section ? `• ${notification.section}` : ''}</span> : null}
      {notification.target_type ? <span className="capitalize">Target: {notification.target_type}</span> : null}
      {notification.teacher_name ? <span>Teacher: {notification.teacher_name}</span> : null}
    </div>

    {notification.media?.length ? (
      <div className="flex flex-wrap gap-3">
        {notification.media.map((item) => (
          <a
            key={item.id || item.file_url}
            href={item.file_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-accentSoft px-4 py-2 text-sm font-medium text-accent transition hover:scale-[1.01]"
          >
            Open {item.file_type}
          </a>
        ))}
      </div>
    ) : null}

    <div className="flex flex-wrap items-center justify-between gap-3">
      {notification.admin_note ? (
        <p className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-muted">
          Admin note: {notification.admin_note}
        </p>
      ) : (
        <div />
      )}
      <div className="flex flex-wrap gap-2">
        {onOpen ? (
          <Button variant="secondary" onClick={onOpen}>
            View details
          </Button>
        ) : null}
        {actions}
      </div>
    </div>
  </Card>
);

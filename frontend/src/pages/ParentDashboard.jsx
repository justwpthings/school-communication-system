import { useEffect, useState } from 'react';

import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { NotificationCard } from '../components/NotificationCard';
import { AppShell } from '../layouts/AppShell';
import { getErrorMessage } from '../services/api';
import { notificationService } from '../services/notificationService';

export const ParentDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);

      try {
        const data = await notificationService.getParentNotifications();
        setNotifications(data);
        setError('');
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  return (
    <AppShell
      title="Parent notifications"
      subtitle="A clear, calm feed of school communication for your family."
    >
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Feed</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">What needs your attention</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            Notifications are organized to stay readable on mobile and easy to scan at a glance.
          </p>
        </div>

        {error ? <p className="rounded-3xl bg-danger/10 px-5 py-4 text-sm text-danger">{error}</p> : null}

        {loading ? <Card>Loading notifications…</Card> : null}

        {!loading && notifications.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="When your school shares a new update, it will appear here in a clean timeline."
          />
        ) : null}

        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            compact={false}
            onOpen={() => setSelectedNotification(notification)}
          />
        ))}
      </section>

      <Modal
        open={Boolean(selectedNotification)}
        title={selectedNotification?.title || 'Notification'}
        description="A distraction-free detail view designed for mobile reading."
        onClose={() => setSelectedNotification(null)}
        size="lg"
      >
        {selectedNotification ? <NotificationCard notification={selectedNotification} /> : null}
      </Modal>
    </AppShell>
  );
};

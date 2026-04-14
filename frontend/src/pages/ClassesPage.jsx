import { useEffect, useState } from 'react';

import { EmptyState } from '../components/EmptyState';
import { ManagementRow } from '../components/ManagementRow';
import { AppShell } from '../layouts/AppShell';
import { adminService } from '../services/adminService';
import { getErrorMessage } from '../services/api';
import { adminNavItems } from '../utils/adminNav';

const getClassTitle = (item) => {
  if (item.class_name && item.section) {
    return `${item.class_name} • ${item.section}`;
  }

  return item.class_name || `Class ${item.id}`;
};

export const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);

      try {
        const data = await adminService.getClasses();
        setClasses(data);
        setError('');
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  return (
    <AppShell
      title="Classes"
      subtitle="A simplified view of class assignments and teacher ownership."
      navigationItems={adminNavItems}
    >
      {error ? <p className="rounded-3xl bg-danger/10 px-5 py-4 text-sm text-danger">{error}</p> : null}

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Management</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Class directory</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Every class stays readable as a simple card row, with the assigned teacher surfaced clearly.
          </p>
        </div>

        {loading ? <ManagementRow title="Loading classes…" /> : null}

        {!loading && classes.length === 0 ? (
          <EmptyState
            title="No classes found"
            description="Create classes in the dashboard and they will appear here with teacher assignment details."
          />
        ) : null}

        {classes.map((item) => (
          <ManagementRow
            key={item.id}
            title={getClassTitle(item)}
            subtitle={item.teacher_name || item.teacher?.name || 'Teacher assignment unavailable'}
            meta={[
              item.teacher_email || item.teacher?.email || null,
              item.student_count ? `${item.student_count} students` : null
            ]}
          />
        ))}
      </section>
    </AppShell>
  );
};

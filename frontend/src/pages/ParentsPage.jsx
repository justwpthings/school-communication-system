import { useEffect, useState } from 'react';

import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ManagementRow } from '../components/ManagementRow';
import { AppShell } from '../layouts/AppShell';
import { adminService } from '../services/adminService';
import { getErrorMessage } from '../services/api';
import { adminNavItems } from '../utils/adminNav';

export const ParentsPage = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ error: '', success: '' });
  const [selectedParent, setSelectedParent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadParents = async () => {
    setLoading(true);

    try {
      const data = await adminService.getParents();
      setParents(data);
      setStatus((current) => ({ ...current, error: '' }));
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParents();
  }, []);

  const handleDeactivate = async () => {
    if (!selectedParent) {
      return;
    }

    setSubmitting(true);

    try {
      await adminService.deactivateParent(selectedParent.id);
      setSelectedParent(null);
      setStatus({ error: '', success: 'Parent account deactivated successfully.' });
      await loadParents();
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Parents"
      subtitle="Review parent access status and deactivate accounts when needed."
      navigationItems={adminNavItems}
    >
      {status.error ? (
        <p className="rounded-3xl bg-danger/10 px-5 py-4 text-sm text-danger">{status.error}</p>
      ) : null}
      {status.success ? (
        <p className="rounded-3xl bg-success/10 px-5 py-4 text-sm text-success">{status.success}</p>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Management</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Parent accounts</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Account state is surfaced clearly so access decisions feel simple and deliberate.
          </p>
        </div>

        {loading ? <ManagementRow title="Loading parents…" /> : null}

        {!loading && parents.length === 0 ? (
          <EmptyState
            title="No parents found"
            description="Parent accounts will appear here after they sign up or are added to the system."
          />
        ) : null}

        {parents.map((parent) => (
          <ManagementRow
            key={parent.id}
            title={parent.name}
            subtitle={parent.email || parent.phone || 'Parent record'}
            meta={[
              parent.phone,
              parent.is_active === false ? 'Inactive account' : 'Active account'
            ]}
            status={parent.status}
            actionLabel={parent.is_active === false ? 'Deactivated' : 'Deactivate'}
            actionVariant="secondary"
            onAction={() => setSelectedParent(parent)}
            actionDisabled={submitting || parent.is_active === false}
          />
        ))}
      </section>

      <ConfirmDialog
        open={Boolean(selectedParent)}
        title={selectedParent ? `Deactivate ${selectedParent.name}?` : 'Deactivate parent'}
        description="This will disable the parent account while keeping the record in the system."
        confirmLabel="Deactivate parent"
        onCancel={() => setSelectedParent(null)}
        onConfirm={handleDeactivate}
        isSubmitting={submitting}
      />
    </AppShell>
  );
};

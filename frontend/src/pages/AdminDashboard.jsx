import { useEffect, useState } from 'react';

import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { NotificationCard } from '../components/NotificationCard';
import { AppShell } from '../layouts/AppShell';
import { adminService } from '../services/adminService';
import { getErrorMessage } from '../services/api';
import { notificationService } from '../services/notificationService';
import { adminNavItems } from '../utils/adminNav';

const quickActionConfigs = {
  teacher: {
    title: 'Create teacher',
    fields: [
      ['name', 'Full name'],
      ['email', 'Email'],
      ['phone', 'Phone'],
      ['password', 'Password']
    ]
  },
  class: {
    title: 'Create class',
    fields: [
      ['class_name', 'Class name'],
      ['section', 'Section'],
      ['teacher_id', 'Teacher ID']
    ]
  },
  student: {
    title: 'Create student',
    fields: [
      ['name', 'Student name'],
      ['class_id', 'Class ID'],
      ['roll_number', 'Roll number']
    ]
  },
  link: {
    title: 'Link parent and student',
    fields: [
      ['parent_id', 'Parent ID'],
      ['student_id', 'Student ID']
    ]
  }
};

const initialForms = {
  teacher: { name: '', email: '', phone: '', password: '' },
  class: { class_name: '', section: '', teacher_id: '' },
  student: { name: '', class_id: '', roll_number: '' },
  link: { parent_id: '', student_id: '' }
};

const analyticsCardBase =
  'rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/[0.03] transition duration-200 hover:-translate-y-[1px]';

export const AdminDashboard = () => {
  const [pendingParents, setPendingParents] = useState([]);
  const [pendingNotifications, setPendingNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({
    teachers: 0,
    students: 0,
    parents: 0,
    pendingParents: 0
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionModal, setActionModal] = useState('');
  const [quickForms, setQuickForms] = useState(initialForms);
  const [status, setStatus] = useState({ error: '', success: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [teachers, students, parents, pendingParentList, notifications] = await Promise.all([
        adminService.getTeachers(),
        adminService.getStudents(),
        adminService.getParents(),
        adminService.getPendingParents(),
        notificationService.getPendingNotifications()
      ]);

      setPendingParents(pendingParentList);
      setPendingNotifications(notifications);
      setAnalytics({
        teachers: teachers.length,
        students: students.length,
        parents: parents.length,
        pendingParents: pendingParentList.length
      });
      setStatus({ error: '', success: '' });
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleParentAction = async (type, userId) => {
    setSubmitting(true);

    try {
      if (type === 'approve') {
        await adminService.approveParent(userId);
      } else {
        await adminService.rejectParent(userId);
      }

      setStatus({
        error: '',
        success: `Parent ${type === 'approve' ? 'approved' : 'rejected'} successfully.`
      });
      await loadDashboard();
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotificationDecision = async (decision) => {
    if (!selectedNotification) {
      return;
    }

    setSubmitting(true);

    try {
      if (decision === 'approve') {
        await notificationService.approveNotification(selectedNotification.id, {
          ...(adminNote ? { admin_note: adminNote } : {})
        });
      } else {
        await notificationService.rejectNotification(selectedNotification.id, {
          status: decision,
          admin_note: adminNote
        });
      }

      setSelectedNotification(null);
      setAdminNote('');
      setStatus({
        error: '',
        success:
          decision === 'approve'
            ? 'Notification approved and sent to eligible recipients.'
            : `Notification marked as ${decision.replace('_', ' ')}.`
      });
      await loadDashboard();
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFormChange = (key, field, value) => {
    setQuickForms((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [field]: value
      }
    }));
  };

  const handleQuickCreate = async (event) => {
    event.preventDefault();
    if (!actionModal) {
      return;
    }

    setSubmitting(true);

    try {
      if (actionModal === 'teacher') {
        await adminService.createTeacher(quickForms.teacher);
      }

      if (actionModal === 'class') {
        await adminService.createClass(quickForms.class);
      }

      if (actionModal === 'student') {
        await adminService.createStudent(quickForms.student);
      }

      if (actionModal === 'link') {
        await adminService.linkParentStudent(quickForms.link);
      }

      setQuickForms(initialForms);
      setActionModal('');
      setStatus({ error: '', success: `${quickActionConfigs[actionModal].title} completed.` });
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Admin dashboard"
      subtitle="Approve people, review notifications, and keep communication moving."
      navigationItems={adminNavItems}
    >
      {status.error ? (
        <p className="rounded-2xl bg-danger/10 px-5 py-4 text-sm text-danger">{status.error}</p>
      ) : null}
      {status.success ? (
        <p className="rounded-2xl bg-success/10 px-5 py-4 text-sm text-success">{status.success}</p>
      ) : null}

      <div className="space-y-8">
        <section className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Overview</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-ink">School activity at a glance</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className={analyticsCardBase}>
              <p className="text-sm text-muted">Total Teachers</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-ink">
                {loading ? '...' : analytics.teachers}
              </p>
            </div>
            <div className={analyticsCardBase}>
              <p className="text-sm text-muted">Total Students</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-ink">
                {loading ? '...' : analytics.students}
              </p>
            </div>
            <div className={analyticsCardBase}>
              <p className="text-sm text-muted">Total Parents</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-ink">
                {loading ? '...' : analytics.parents}
              </p>
            </div>
            <div className={analyticsCardBase}>
              <p className="text-sm text-muted">Pending Parents</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-ink">
                {loading ? '...' : analytics.pendingParents}
              </p>
            </div>
          </div>
        </section>

        <section>
          <Card className="soft-panel rounded-2xl p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted">Quick actions</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Keep school records current</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setActionModal('teacher')}>Create teacher</Button>
                <Button variant="secondary" onClick={() => setActionModal('class')}>Create class</Button>
                <Button variant="secondary" onClick={() => setActionModal('student')}>Create student</Button>
                <Button variant="secondary" onClick={() => setActionModal('link')}>Link parent-student</Button>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted">Pending parents</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Review new access requests</h2>
            </div>

            {loading ? <Card className="rounded-2xl p-6">Loading pending parents…</Card> : null}

            {!loading && pendingParents.length === 0 ? (
              <EmptyState
                title="Everything is clear"
                description="There are no parent accounts waiting for approval right now."
              />
            ) : null}

            {pendingParents.map((parent) => (
              <Card key={parent.id} className="space-y-4 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-tight text-ink">{parent.name}</h3>
                      <Badge tone={parent.status}>{parent.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">{parent.email}</p>
                    <p className="text-sm text-muted">{parent.phone}</p>
                  </div>
                  <p className="text-sm text-muted">
                    {new Date(parent.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => handleParentAction('approve', parent.id)} disabled={submitting}>
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleParentAction('reject', parent.id)}
                    disabled={submitting}
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted">Pending notifications</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Approve teacher communication</h2>
            </div>

            {loading ? <Card className="rounded-2xl p-6">Loading pending notifications…</Card> : null}

            {!loading && pendingNotifications.length === 0 ? (
              <EmptyState
                title="No notifications waiting"
                description="Teacher updates that need approval will appear here."
              />
            ) : null}

            {pendingNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                compact
                onOpen={() => {
                  setSelectedNotification(notification);
                  setAdminNote(notification.admin_note || '');
                }}
                actions={
                  <Button onClick={() => {
                    setSelectedNotification(notification);
                    setAdminNote(notification.admin_note || '');
                  }}>
                    Review
                  </Button>
                }
              />
            ))}
          </div>
        </section>
      </div>

      <Modal
        open={Boolean(selectedNotification)}
        title={selectedNotification?.title || 'Notification review'}
        description="Approve, reject, or request revision with a short note."
        onClose={() => {
          setSelectedNotification(null);
          setAdminNote('');
        }}
        footer={
          <>
            <Button variant="secondary" onClick={() => handleNotificationDecision('needs_revision')} disabled={submitting}>
              Needs revision
            </Button>
            <Button variant="secondary" onClick={() => handleNotificationDecision('rejected')} disabled={submitting}>
              Reject
            </Button>
            <Button onClick={() => handleNotificationDecision('approve')} disabled={submitting}>
              Approve & send
            </Button>
          </>
        }
      >
        {selectedNotification ? (
          <>
            <NotificationCard notification={selectedNotification} />
            <Input
              as="textarea"
              label="Admin note"
              placeholder="Optional feedback for the teacher"
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
            />
          </>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(actionModal)}
        title={actionModal ? quickActionConfigs[actionModal].title : 'Create record'}
        description="Use lightweight management actions when school data changes."
        onClose={() => setActionModal('')}
      >
        {actionModal ? (
          <form className="space-y-4" onSubmit={handleQuickCreate}>
            {quickActionConfigs[actionModal].fields.map(([field, label]) => (
              <Input
                key={field}
                label={label}
                type={field.includes('password') ? 'password' : field.endsWith('_id') ? 'number' : 'text'}
                value={quickForms[actionModal][field]}
                onChange={(event) => handleQuickFormChange(actionModal, field, event.target.value)}
                required
              />
            ))}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Saving…' : quickActionConfigs[actionModal].title}
            </Button>
          </form>
        ) : null}
      </Modal>
    </AppShell>
  );
};

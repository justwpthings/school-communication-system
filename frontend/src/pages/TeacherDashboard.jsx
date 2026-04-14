import { useEffect, useState } from 'react';

import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { NotificationCard } from '../components/NotificationCard';
import { AppShell } from '../layouts/AppShell';
import { getErrorMessage } from '../services/api';
import { notificationService } from '../services/notificationService';
import { teacherService } from '../services/teacherService';

const initialForm = {
  title: '',
  message: '',
  class_id: '',
  category_id: '',
  target_type: 'class',
  student_ids: [],
  media: []
};

const getClassLabel = (item) => {
  const className = item.class_name || item.name || `Class ${item.id}`;
  return item.section ? `${className} - ${item.section}` : className;
};

export const TeacherDashboard = () => {
  const [form, setForm] = useState(initialForm);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState({ error: '', success: '' });
  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);

    try {
      const data = await notificationService.getTeacherNotifications();
      setNotifications(data);
      setStatus((current) => ({ ...current, error: '' }));
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setClassesLoading(true);

      try {
        const [notificationData, classData] = await Promise.all([
          notificationService.getTeacherNotifications(),
          teacherService.getClasses()
        ]);

        setNotifications(notificationData);
        setClasses(classData);
        setStatus({ error: '', success: '' });
      } catch (error) {
        setStatus({ error: getErrorMessage(error), success: '' });
      } finally {
        setLoading(false);
        setClassesLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      if (!form.class_id || form.target_type !== 'students') {
        setStudents([]);
        return;
      }

      setStudentsLoading(true);

      try {
        const data = await teacherService.getStudents(form.class_id);
        setStudents(data);
      } catch (error) {
        setStatus({ error: getErrorMessage(error), success: '' });
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudents();
  }, [form.class_id, form.target_type]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'class_id' ? { student_ids: [] } : {})
    }));
  };

  const handleFileChange = (event) => {
    setForm((current) => ({
      ...current,
      media: Array.from(event.target.files || [])
    }));
  };

  const handleTargetTypeChange = (targetType) => {
    setForm((current) => ({
      ...current,
      target_type: targetType,
      student_ids: targetType === 'class' ? [] : current.student_ids
    }));
  };

  const handleStudentToggle = (studentId) => {
    setForm((current) => {
      const alreadySelected = current.student_ids.includes(studentId);

      return {
        ...current,
        student_ids: alreadySelected
          ? current.student_ids.filter((id) => id !== studentId)
          : [...current.student_ids, studentId]
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ error: '', success: '' });

    try {
      if (form.target_type === 'students' && !form.student_ids.length) {
        throw new Error('Select at least one student before sending this notification.');
      }

      await notificationService.createNotification(form);
      setForm(initialForm);
      setStudents([]);
      setStatus({
        error: '',
        success: 'Notification created and sent for admin approval.'
      });
      await loadNotifications();
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Teacher dashboard"
      subtitle="Create thoughtful class updates and track their approval status."
    >
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-muted">Compose</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Create a notification</h2>
            <p className="max-w-xl text-sm leading-6 text-muted">
              Keep the message simple and focused. Choose a full class or a smaller set of students before
              sending it for admin approval.
            </p>
          </div>

          {status.error ? (
            <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{status.error}</p>
          ) : null}
          {status.success ? (
            <p className="rounded-2xl bg-success/10 px-4 py-3 text-sm text-success">{status.success}</p>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Title"
              name="title"
              placeholder="Tomorrow's science project reminder"
              value={form.title}
              onChange={handleChange}
              required
            />
            <Input
              as="textarea"
              label="Message"
              name="message"
              placeholder="Please send the chart paper and labelled materials by 8:30 AM."
              value={form.message}
              onChange={handleChange}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input as="select" label="Class" name="class_id" value={form.class_id} onChange={handleChange} required>
                <option value="">Select a class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {getClassLabel(item)}
                  </option>
                ))}
              </Input>
              <Input
                label="Category ID"
                name="category_id"
                type="number"
                placeholder="Optional"
                value={form.category_id}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-3">
              <span className="text-sm font-medium text-ink">Audience</span>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleTargetTypeChange('class')}
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    form.target_type === 'class'
                      ? 'brand-tint border-transparent shadow-soft'
                      : 'border-stroke bg-white hover:-translate-y-[1px] hover:shadow-soft'
                  }`}
                >
                  <p className="text-sm font-semibold text-ink">Send to entire class</p>
                  <p className="mt-1 text-sm text-muted">Every active parent linked to the selected class receives it.</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleTargetTypeChange('students')}
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    form.target_type === 'students'
                      ? 'brand-tint border-transparent shadow-soft'
                      : 'border-stroke bg-white hover:-translate-y-[1px] hover:shadow-soft'
                  }`}
                >
                  <p className="text-sm font-semibold text-ink">Select students</p>
                  <p className="mt-1 text-sm text-muted">Pick individual students from the selected class.</p>
                </button>
              </div>
            </div>

            {form.target_type === 'students' ? (
              <div className="space-y-3 rounded-[28px] border border-stroke bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Students in this class</p>
                    <p className="text-sm text-muted">
                      {form.student_ids.length
                        ? `${form.student_ids.length} selected`
                        : 'Choose one or more students'}
                    </p>
                  </div>
                  {form.student_ids.length ? <Badge tone="approved">{form.student_ids.length} selected</Badge> : null}
                </div>

                {!form.class_id ? (
                  <p className="text-sm text-muted">Select a class first to load students.</p>
                ) : null}

                {studentsLoading ? <p className="text-sm text-muted">Loading students…</p> : null}

                {form.class_id && !studentsLoading && students.length === 0 ? (
                  <p className="text-sm text-muted">No students were returned for this class.</p>
                ) : null}

                <div className="space-y-3">
                  {students.map((student) => {
                    const checked = form.student_ids.includes(student.id);

                    return (
                      <label
                        key={student.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${
                          checked
                            ? 'brand-tint border-transparent'
                            : 'border-stroke bg-surface hover:bg-white'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-ink">{student.name}</p>
                          <p className="text-sm text-muted">
                            {student.roll_number ? `Roll number ${student.roll_number}` : 'Student record'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleStudentToggle(student.id)}
                          className="h-4 w-4 accent-[var(--primary-color)]"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <Input
              label="Attachments"
              helper="You can upload images, videos, or PDFs up to a combined total of 20MB."
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={handleFileChange}
            />
            <Button type="submit" className="w-full py-3.5 text-base" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Send for approval'}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">My notifications</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Recent updates</h2>
          </div>

          {loading || classesLoading ? <Card>Loading your workspace…</Card> : null}

          {!loading && notifications.length === 0 ? (
            <EmptyState
              title="No notifications yet"
              description="Create your first class update and it will appear here after submission."
            />
          ) : null}

          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              compact
              onOpen={() => setSelectedNotification(notification)}
            />
          ))}
        </div>
      </section>

      <Modal
        open={Boolean(selectedNotification)}
        title={selectedNotification?.title || 'Notification details'}
        description="A full view of your notification, attachments, and review note."
        onClose={() => setSelectedNotification(null)}
      >
        {selectedNotification ? <NotificationCard notification={selectedNotification} /> : null}
      </Modal>
    </AppShell>
  );
};

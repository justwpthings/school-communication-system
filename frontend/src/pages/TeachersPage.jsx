import { useEffect, useRef, useState } from 'react';

import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { AppShell } from '../layouts/AppShell';
import { adminService } from '../services/adminService';
import { getErrorMessage } from '../services/api';
import { adminNavItems } from '../utils/adminNav';

const formatCreatedDate = (value) => {
  if (!value) {
    return 'Created date unavailable';
  }

  return `Created on ${new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`;
};

const formatClassTag = (item) => {
  if (!item?.class_name) {
    return null;
  }

  return item.section ? `${item.class_name}-${item.section}` : item.class_name;
};

export const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ error: '', success: '' });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: true,
    class_ids: []
  });
  const [submitting, setSubmitting] = useState(false);
  const importRef = useRef(null);

  const loadTeachers = async () => {
    setLoading(true);

    try {
      const [teacherData, classData] = await Promise.all([
        adminService.getTeachers(),
        adminService.getClasses()
      ]);
      setTeachers(teacherData);
      setClasses(classData);
      setStatus((current) => ({ ...current, error: '' }));
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const openEditModal = (teacher) => {
    const matchedClassIds = (teacher.classes || [])
      .map((teacherClass) =>
        classes.find(
          (item) =>
            item.class_name === teacherClass.class_name &&
            String(item.section || '') === String(teacherClass.section || '')
        )?.id
      )
      .filter(Boolean);

    setEditingTeacher(teacher);
    setEditForm({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      is_active: teacher.is_active !== false,
      class_ids: matchedClassIds
    });
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleTeacherClass = (classId) => {
    setEditForm((current) => ({
      ...current,
      class_ids: current.class_ids.includes(classId)
        ? current.class_ids.filter((id) => id !== classId)
        : [...current.class_ids, classId]
    }));
  };

  const handleSaveTeacher = async (event) => {
    event.preventDefault();

    if (!editingTeacher) {
      return;
    }

    setSubmitting(true);

    try {
      await adminService.updateTeacher(editingTeacher.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        is_active: editForm.is_active,
        class_ids: editForm.class_ids
      });

      setEditingTeacher(null);
      setStatus({ error: '', success: 'Teacher updated successfully.' });
      await loadTeachers();
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeacher) {
      return;
    }

    setSubmitting(true);

    try {
      await adminService.deleteTeacher(selectedTeacher.id);
      setSelectedTeacher(null);
      setStatus({ error: '', success: 'Teacher removed successfully.' });
      await loadTeachers();
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportTeachers = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSubmitting(true);

    try {
      await adminService.importTeachers(file);
      setStatus({ error: '', success: 'Teachers imported successfully.' });
      await loadTeachers();
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      event.target.value = '';
      setSubmitting(false);
    }
  };

  const handleExportTeachers = async () => {
    setSubmitting(true);

    try {
      await adminService.exportTeachers();
      setStatus({ error: '', success: 'Teacher export started.' });
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Teachers"
      subtitle="A clean directory of teaching staff with quick management actions."
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
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Teacher directory</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Keep the staff list current without the visual weight of a traditional admin grid.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            ref={importRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImportTeachers}
          />
          <Button variant="secondary" onClick={() => importRef.current?.click()} disabled={submitting}>
            Import CSV
          </Button>
          <Button variant="secondary" onClick={handleExportTeachers} disabled={submitting}>
            Export CSV
          </Button>
        </div>

        {loading ? <Card className="rounded-2xl p-6 text-sm text-muted">Loading teachers…</Card> : null}

        {!loading && teachers.length === 0 ? (
          <EmptyState
            title="No teachers found"
            description="Teachers will appear here when they are created in the admin dashboard."
          />
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => {
            const teacherClasses = (teacher.classes || [])
              .map(formatClassTag)
              .filter(Boolean);

            return (
              <Card
                key={teacher.id}
                className="rounded-2xl p-6 transition duration-200 hover:-translate-y-[1px] hover:shadow-soft"
              >
                <div className="flex h-full flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold tracking-tight text-ink">{teacher.name}</h3>
                      <Badge tone={teacher.is_active === false ? 'rejected' : 'approved'}>
                        {teacher.is_active === false ? 'inactive' : 'active'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted">{teacher.email}</p>
                    <p className="text-sm text-muted">
                      {teacher.phone || 'Phone unavailable'}
                      {' • '}
                      {teacher.is_active === false ? 'Inactive account' : 'Active account'}
                    </p>
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-ink">Assigned classes</p>
                      {teacherClasses.length ? (
                        <div className="flex flex-wrap gap-2">
                          {teacherClasses.map((classLabel) => (
                            <span
                              key={`${teacher.id}-${classLabel}`}
                              className="rounded-full px-3 py-1.5 text-sm font-medium"
                              style={{
                                backgroundColor: 'rgba(var(--primary-color-rgb), 0.08)',
                                color: 'var(--primary-color)'
                              }}
                            >
                              {classLabel}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted">No classes assigned yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-muted">{formatCreatedDate(teacher.created_at)}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="secondary" onClick={() => openEditModal(teacher)} disabled={submitting}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => setSelectedTeacher(teacher)} disabled={submitting}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(selectedTeacher)}
        title={selectedTeacher ? `Delete ${selectedTeacher.name}?` : 'Delete teacher'}
        description="This action should only be used when the teacher record is no longer needed."
        confirmLabel="Delete teacher"
        onCancel={() => setSelectedTeacher(null)}
        onConfirm={handleDelete}
        isSubmitting={submitting}
      />

      <Modal
        open={Boolean(editingTeacher)}
        title={editingTeacher ? `Edit ${editingTeacher.name}` : 'Edit teacher'}
        description="Update teacher details, account state, and assigned classes."
        onClose={() => setEditingTeacher(null)}
        size="lg"
      >
        {editingTeacher ? (
          <form className="space-y-5" onSubmit={handleSaveTeacher}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Name"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditChange}
                required
              />
            </div>

            <Input
              label="Phone"
              name="phone"
              value={editForm.phone}
              onChange={handleEditChange}
            />

            <label className="flex items-center justify-between rounded-2xl border border-stroke bg-white px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">Active account</p>
                <p className="text-sm text-muted">Control whether this teacher can access the app.</p>
              </div>
              <input
                type="checkbox"
                name="is_active"
                checked={editForm.is_active}
                onChange={handleEditChange}
                className="h-5 w-5 accent-[var(--primary-color)]"
              />
            </label>

            <div className="space-y-3">
              <p className="text-sm font-medium text-ink">Assigned classes</p>
              <div className="flex flex-wrap gap-2">
                {classes.map((item) => {
                  const classLabel = formatClassTag(item);
                  const selected = editForm.class_ids.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleTeacherClass(item.id)}
                      className="rounded-full px-3 py-2 text-sm font-medium transition"
                      style={
                        selected
                          ? {
                              backgroundColor: 'rgba(var(--primary-color-rgb), 0.14)',
                              color: 'var(--primary-color)'
                            }
                          : {
                              backgroundColor: '#f4f4f8',
                              color: '#6e6e73'
                            }
                      }
                    >
                      {classLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditingTeacher(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </AppShell>
  );
};

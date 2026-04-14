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

const getStudentClassLabel = (student) => {
  if (student.class_name && student.section) {
    return `${student.class_name} • ${student.section}`;
  }

  if (student.class_name) {
    return student.class_name;
  }

  if (student.class_id) {
    return `Class ID ${student.class_id}`;
  }

  return 'Class unavailable';
};

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

const getParentInfo = (student) => {
  const firstParent = Array.isArray(student.parents) ? student.parents[0] : null;

  return {
    name:
      firstParent?.name ||
      student.parent_name ||
      student.parent?.name ||
      'Parent not linked',
    email:
      firstParent?.email ||
      student.parent_email ||
      student.parent?.email ||
      'Email unavailable',
    phone:
      firstParent?.phone ||
      student.parent_phone ||
      student.parent?.phone ||
      'Phone unavailable'
  };
};

export const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ error: '', success: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    roll_number: '',
    class_id: '',
    parent_name: '',
    parent_email: '',
    parent_phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const importRef = useRef(null);

  const loadStudents = async () => {
    setLoading(true);

    try {
      const [studentData, classData] = await Promise.all([
        adminService.getStudents(),
        adminService.getClasses()
      ]);
      setStudents(studentData);
      setClasses(classData);
      setStatus((current) => ({ ...current, error: '' }));
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const openEditModal = (student) => {
    const parentInfo = getParentInfo(student);

    setEditingStudent(student);
    setEditForm({
      name: student.name || '',
      roll_number: student.roll_number || '',
      class_id: student.class_id || '',
      parent_name: parentInfo.name === 'Parent not linked' ? '' : parentInfo.name,
      parent_email: parentInfo.email === 'Email unavailable' ? '' : parentInfo.email,
      parent_phone: parentInfo.phone === 'Phone unavailable' ? '' : parentInfo.phone
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSaveStudent = async (event) => {
    event.preventDefault();

    if (!editingStudent) {
      return;
    }

    setSubmitting(true);

    try {
      await adminService.updateStudent(editingStudent.id, {
        name: editForm.name,
        roll_number: editForm.roll_number,
        class_id: editForm.class_id,
        parent_name: editForm.parent_name,
        parent_email: editForm.parent_email,
        parent_phone: editForm.parent_phone
      });

      setEditingStudent(null);
      setStatus({ error: '', success: 'Student updated successfully.' });
      await loadStudents();
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) {
      return;
    }

    setSubmitting(true);

    try {
      await adminService.deleteStudent(selectedStudent.id);
      setSelectedStudent(null);
      setStatus({ error: '', success: 'Student removed successfully.' });
      await loadStudents();
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportStudents = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSubmitting(true);

    try {
      await adminService.importStudents(file);
      setStatus({ error: '', success: 'Students imported successfully.' });
      await loadStudents();
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      event.target.value = '';
      setSubmitting(false);
    }
  };

  const handleExportStudents = async () => {
    setSubmitting(true);

    try {
      await adminService.exportStudents();
      setStatus({ error: '', success: 'Student export started.' });
    } catch (error) {
      setStatus({ error: getErrorMessage(error), success: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Students"
      subtitle="A lightweight student roster organized for quick scanning."
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
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Student roster</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            View student placement at a glance, with gentle spacing and only the fields that matter.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            ref={importRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImportStudents}
          />
          <Button variant="secondary" onClick={() => importRef.current?.click()} disabled={submitting}>
            Import CSV
          </Button>
          <Button variant="secondary" onClick={handleExportStudents} disabled={submitting}>
            Export CSV
          </Button>
        </div>

        {loading ? <Card className="rounded-2xl p-6 text-sm text-muted">Loading students…</Card> : null}

        {!loading && students.length === 0 ? (
          <EmptyState
            title="No students found"
            description="Students will appear here after they are added through the admin dashboard."
          />
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => {
            const parentInfo = getParentInfo(student);

            return (
              <Card
                key={student.id}
                className="rounded-2xl p-6 transition duration-200 hover:-translate-y-[1px] hover:shadow-soft"
              >
                <div className="flex h-full flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold tracking-tight text-ink">{student.name}</h3>
                      <Badge tone={student.is_active === false ? 'rejected' : 'approved'}>
                        {student.is_active === false ? 'inactive' : 'active'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted">{getStudentClassLabel(student)}</p>
                    <p className="text-sm text-muted">
                      {student.roll_number ? `Roll number ${student.roll_number}` : 'Roll number unavailable'}
                    </p>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-ink">Parent contact</p>
                      <div className="space-y-1 text-sm text-muted">
                        <p>{parentInfo.name}</p>
                        <p>{parentInfo.email}</p>
                        <p>{parentInfo.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-muted">{formatCreatedDate(student.created_at)}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="secondary" onClick={() => openEditModal(student)} disabled={submitting}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => setSelectedStudent(student)} disabled={submitting}>
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
        open={Boolean(selectedStudent)}
        title={selectedStudent ? `Delete ${selectedStudent.name}?` : 'Delete student'}
        description="Confirm before removing this student record from the system."
        confirmLabel="Delete student"
        onCancel={() => setSelectedStudent(null)}
        onConfirm={handleDelete}
        isSubmitting={submitting}
      />

      <Modal
        open={Boolean(editingStudent)}
        title={editingStudent ? `Edit ${editingStudent.name}` : 'Edit student'}
        description="Update the student record and the linked parent contact details."
        onClose={() => setEditingStudent(null)}
        size="lg"
      >
        {editingStudent ? (
          <form className="space-y-5" onSubmit={handleSaveStudent}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Student name"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                required
              />
              <Input
                label="Roll number"
                name="roll_number"
                value={editForm.roll_number}
                onChange={handleEditChange}
                required
              />
            </div>

            <Input as="select" label="Class" name="class_id" value={editForm.class_id} onChange={handleEditChange} required>
              <option value="">Select a class</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.section ? `${item.class_name} - ${item.section}` : item.class_name}
                </option>
              ))}
            </Input>

            <div className="space-y-3 rounded-2xl border border-stroke bg-white p-4">
              <div>
                <p className="text-sm font-medium text-ink">Parent details</p>
                <p className="text-sm text-muted">
                  Changes here update the linked parent record across the system.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Parent name"
                  name="parent_name"
                  value={editForm.parent_name}
                  onChange={handleEditChange}
                />
                <Input
                  label="Parent email"
                  name="parent_email"
                  type="email"
                  value={editForm.parent_email}
                  onChange={handleEditChange}
                />
              </div>
              <Input
                label="Parent phone"
                name="parent_phone"
                value={editForm.parent_phone}
                onChange={handleEditChange}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditingStudent(null)} disabled={submitting}>
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

import api from './api';

const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const adminService = {
  async getPendingParents() {
    const response = await api.get('/admin/pending-parents');
    return response.data.data;
  },
  async getTeachers() {
    const response = await api.get('/admin/teachers');
    return response.data.data;
  },
  async getStudents() {
    const response = await api.get('/admin/students');
    return response.data.data;
  },
  async getParents() {
    const response = await api.get('/admin/parents');
    return response.data.data;
  },
  async getClasses() {
    const response = await api.get('/admin/classes');
    return response.data.data;
  },
  async approveParent(userId) {
    const response = await api.post('/admin/approve-parent', { user_id: userId });
    return response.data.data;
  },
  async rejectParent(userId) {
    const response = await api.post('/admin/reject-parent', { user_id: userId });
    return response.data.data;
  },
  async deleteTeacher(id) {
    const response = await api.delete(`/admin/teacher/${id}`);
    return response.data;
  },
  async updateTeacher(id, payload) {
    const response = await api.put(`/admin/teacher/${id}`, payload);
    return response.data;
  },
  async deleteStudent(id) {
    const response = await api.delete(`/admin/student/${id}`);
    return response.data;
  },
  async updateStudent(id, payload) {
    const response = await api.put(`/admin/student/${id}`, payload);
    return response.data;
  },
  async deactivateParent(id) {
    const response = await api.post(`/admin/parent/${id}/deactivate`);
    return response.data;
  },
  async importTeachers(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/admin/teachers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },
  async exportTeachers() {
    const response = await api.get('/admin/teachers/export', {
      responseType: 'blob'
    });

    downloadBlob(response.data, 'teachers.csv');
  },
  async importStudents(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/admin/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },
  async exportStudents() {
    const response = await api.get('/admin/students/export', {
      responseType: 'blob'
    });

    downloadBlob(response.data, 'students.csv');
  },
  async createTeacher(payload) {
    const response = await api.post('/admin/create-teacher', payload);
    return response.data;
  },
  async createClass(payload) {
    const response = await api.post('/admin/create-class', payload);
    return response.data;
  },
  async createStudent(payload) {
    const response = await api.post('/admin/create-student', payload);
    return response.data;
  },
  async linkParentStudent(payload) {
    const response = await api.post('/admin/link-parent-student', payload);
    return response.data;
  }
};

import api from './api';

export const notificationService = {
  async getPendingNotifications() {
    const response = await api.get('/notifications/pending');
    return response.data.data;
  },
  async approveNotification(id, payload = {}) {
    const response = await api.post(`/notifications/${id}/approve`, payload);
    return response.data.data;
  },
  async rejectNotification(id, payload) {
    const response = await api.post(`/notifications/${id}/reject`, payload);
    return response.data.data;
  },
  async createNotification(payload) {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('message', payload.message);
    formData.append('class_id', payload.class_id);
    formData.append('target_type', payload.target_type);

    if (payload.category_id) {
      formData.append('category_id', payload.category_id);
    }

    if (payload.target_type === 'students' && payload.student_ids?.length) {
      formData.append('student_ids', payload.student_ids.join(','));
    }

    Array.from(payload.media || []).forEach((file) => {
      formData.append('media', file);
    });

    const response = await api.post('/notifications/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.data;
  },
  async getTeacherNotifications() {
    const response = await api.get('/notifications/my');
    return response.data.data;
  },
  async getParentNotifications() {
    const response = await api.get('/notifications/');
    return response.data.data;
  }
};

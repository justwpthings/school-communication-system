import api from './api';

export const teacherService = {
  async getClasses() {
    const response = await api.get('/teacher/classes');
    return response.data.data;
  },
  async getStudents(classId) {
    const response = await api.get('/teacher/students', {
      params: {
        class_id: classId
      }
    });
    return response.data.data;
  }
};

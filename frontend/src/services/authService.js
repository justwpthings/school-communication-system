import api from './api';

export const authService = {
  async login(payload) {
    const response = await api.post('/auth/login', payload);
    return response.data.data;
  },
  async signup(payload) {
    const response = await api.post('/auth/signup', payload);
    return response.data;
  }
};

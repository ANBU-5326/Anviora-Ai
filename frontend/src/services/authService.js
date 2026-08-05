import api from './api';

export const authService = {
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.access_token) {
      localStorage.setItem('anviora_token', response.data.access_token);
      localStorage.setItem('anviora_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async googleLogin(email, name, avatar = null) {
    const response = await api.post('/auth/google-login', { email, name, avatar });
    if (response.data && response.data.access_token) {
      localStorage.setItem('anviora_token', response.data.access_token);
      localStorage.setItem('anviora_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data && response.data.access_token) {
      localStorage.setItem('anviora_token', response.data.access_token);
      localStorage.setItem('anviora_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore errors on logout request
    }
    localStorage.removeItem('anviora_token');
    localStorage.removeItem('anviora_user');
    return { success: true };
  }
};


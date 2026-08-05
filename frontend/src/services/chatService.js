import api from './api';

export const chatService = {
  async getChatMessages() {
    const response = await api.get('/chat/messages');
    return response.data;
  },

  async saveChatMessage(role, content) {
    const response = await api.post('/chat/messages', { role, content });
    return response.data;
  }
};

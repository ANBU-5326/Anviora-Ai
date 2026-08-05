import api from './api';

export const mentorService = {
  async sendMessage(messageText, chatHistory = [], context = null) {
    // Format history: UI has { sender: 'user'|'mentor', text }, API expects { role, content }
    const formattedHistory = chatHistory
      .filter(m => m.sender !== 'system')
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    try {
      const response = await api.post('/ai/chat', {
        message: messageText,
        history: formattedHistory,
        context: context
      });

      const reply = response.data?.response || 'Sorry, I could not process that. Please try again.';

      return {
        sender: 'mentor',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } catch (error) {
      console.error("Error sending message to AI Mentor:", error);
      throw error;
    }
  },

  async getMentorMessages() {
    const response = await api.get('/mentor/messages');
    return response.data;
  },

  async saveMentorMessage(role, content) {
    const response = await api.post('/mentor/messages', { role, content });
    return response.data;
  }
};

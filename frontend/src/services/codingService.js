import api from './api';

export const codingService = {
  async getStats() {
    const response = await api.get('/coding/stats');
    const data = response.data;
    return {
      solvedCount: data.solved_count,
      totalCount: data.total_count,
      easySolved: data.easy_solved,
      mediumSolved: data.medium_solved,
      hardSolved: data.hard_solved,
      streak: data.streak,
      timezone: data.timezone || 'Asia/Kolkata',
      streakFreezesRemaining: data.streak_freezes_remaining ?? 2,
      rank: data.rank,
      recentSubmissions: (data.recent_submissions || []).map(r => ({
        id: r.id,
        title: r.title,
        difficulty: r.difficulty,
        status: r.status,
        topic: r.topic || 'General',
        platform: r.platform || 'LeetCode',
        notes: r.notes || '',
        date: this.formatDate(r.submitted_at)
      }))
    };
  },

  async logProblem(title, difficulty, status, topic = 'General', platform = 'LeetCode', notes = '') {
    const response = await api.post('/coding/log', { title, difficulty, status, topic, platform, notes });
    const data = response.data;
    return {
      solvedCount: data.solved_count,
      totalCount: data.total_count,
      easySolved: data.easy_solved,
      mediumSolved: data.medium_solved,
      hardSolved: data.hard_solved,
      streak: data.streak,
      timezone: data.timezone || 'Asia/Kolkata',
      streakFreezesRemaining: data.streak_freezes_remaining ?? 2,
      rank: data.rank,
      recentSubmissions: (data.recent_submissions || []).map(r => ({
        id: r.id,
        title: r.title,
        difficulty: r.difficulty,
        status: r.status,
        topic: r.topic || 'General',
        platform: r.platform || 'LeetCode',
        notes: r.notes || '',
        date: this.formatDate(r.submitted_at)
      }))
    };
  },

  async runCode(sourceCode, language = 'python', stdin = '', expectedOutput = '') {
    const response = await api.post('/coding/run', {
      source_code: sourceCode,
      language,
      stdin,
      expected_output: expectedOutput
    });
    return response.data;
  },

  async generateActivityData() {
    const response = await api.get('/coding/activity');
    return response.data;
  },

  async saveCodingSuggestion(content) {
    const response = await api.post('/coding/suggestions', { content });
    return response.data;
  },

  async getCodingSuggestions() {
    const response = await api.get('/coding/suggestions');
    return response.data;
  },

  formatDate(isoString) {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const diff = Date.now() - date.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return mins <= 1 ? 'Just now' : `${mins} mins ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs} hours ago`;
      const days = Math.floor(hrs / 24);
      return `${days} days ago`;
    } catch(e) {
      return 'Recent';
    }
  }
};

import api from './api';

export const studyService = {
  async getPlans() {
    const response = await api.get('/study/plans');
    const plans = response.data || [];
    return plans.map(p => ({
      id: p.id,
      title: p.title,
      subject: p.subject,
      duration: p.duration,
      progress: p.progress,
      priority: p.priority || 'medium',
      examDate: p.exam_date,
      streak: p.streak || 0,
      burnoutScore: p.burnout_score || 10,
      tasks: (p.tasks || []).map(t => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        difficulty: t.difficulty || 'medium'
      }))
    }));
  },

  async addPlan(newPlan) {
    const response = await api.post('/study/plans', {
      title: newPlan.title,
      subject: newPlan.subject,
      duration: newPlan.duration,
      priority: newPlan.priority || 'medium',
      exam_date: newPlan.examDate,
      streak: newPlan.streak || 0,
      burnout_score: newPlan.burnoutScore || 10,
      tasks: (newPlan.tasks || []).map(t => ({
        text: t.text,
        difficulty: t.difficulty || 'medium'
      }))
    });
    return response.data;
  },

  async toggleTask(planId, taskId) {
    const response = await api.patch(`/study/plans/${planId}/tasks/${taskId}`);
    const plans = response.data || [];
    return plans.map(p => ({
      id: p.id,
      title: p.title,
      subject: p.subject,
      duration: p.duration,
      progress: p.progress,
      priority: p.priority || 'medium',
      examDate: p.exam_date,
      streak: p.streak || 0,
      burnoutScore: p.burnout_score || 10,
      tasks: (p.tasks || []).map(t => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        difficulty: t.difficulty || 'medium'
      }))
    }));
  },

  async addTask(planId, taskText) {
    const response = await api.post(`/study/plans/${planId}/tasks`, {
      text: taskText
    });
    // The backend add_task endpoint returns TaskResponse.
    // For backward compatibility, let's fetch and return all updated plans.
    return this.getPlans();
  },

  async deletePlan(planId) {
    await api.delete(`/study/plans/${planId}`);
    return this.getPlans();
  }
};

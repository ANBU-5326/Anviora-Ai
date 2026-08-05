/**
 * skillService.js — Fixed version
 *
 * All endpoints use JWT Bearer auth (token from localStorage "anviora_token").
 * The api.js request() wrapper already attaches the token automatically.
 * We no longer manually look up userId for JWT-protected endpoints —
 * the backend extracts the user from the token via get_current_user.
 *
 * The only exception is the public /skills/{user_id} GET which is used
 * by the dashboard radar chart — that still passes user_id explicitly.
 */

import api from './api';

// ─── Helper: get user ID from localStorage (for public/dashboard endpoints only) ──
const getUserId = () => {
  try {
    const stored = localStorage.getItem('anviora_user');
    if (stored) return JSON.parse(stored)?.id ?? null;
  } catch (_) {}
  return null;
};

export const skillService = {
  /**
   * Get radar-chart skill bars for the current user.
   * Uses JWT auth endpoint (GET /skills) — no userId needed.
   */
  async getSkills() {
    const response = await api.get('/skills');
    return response.data ?? [];
  },

  /**
   * Upsert a skill score (0-100) for the current user.
   * POST /skills/assess  { subject, score }
   */
  async assessSkill(subject, score) {
    const response = await api.post('/skills/assess', { subject, score });
    return response.data ?? [];
  },

  /**
   * Save a full Skill IQ assessment result.
   * POST /skills/assessments
   */
  async saveAssessment(data) {
    const response = await api.post('/skills/assessments', data);
    return response.data;
  },

  /**
   * Retrieve all past Skill IQ assessment runs for the current user.
   * GET /skills/assessments/history
   */
  async getAssessmentHistory() {
    const response = await api.get('/skills/assessments/history');
    return response.data ?? [];
  },

  /**
   * Save a lightweight AI analysis entry (used alongside saveAssessment).
   * POST /skills/analyses
   */
  async saveSkillAnalysis(data) {
    const response = await api.post('/skills/analyses', data);
    return response.data;
  },

  /**
   * Retrieve all AI analyses for the current user.
   * GET /skills/analyses
   */
  async getSkillAnalyses() {
    const response = await api.get('/skills/analyses');
    return response.data ?? [];
  },

  /**
   * Curated learning resources (public, no auth required).
   * GET /skills/resources
   */
  async getResources() {
    const response = await api.get('/skills/resources');
    return response.data ?? {};
  },

  /**
   * Public endpoint — used by dashboard radar when displaying another user's skills.
   * Falls back to JWT endpoint if no userId available.
   */
  async getSkillsByUser(userId) {
    const id = userId ?? getUserId();
    const url = id ? `/skills/${id}` : '/skills';
    const response = await api.get(url);
    return response.data ?? [];
  },

  // ─── 360° SKILL ANALYZER METHODS ──────────────────────────────────────────

  async fetchTargetCareers() {
    const response = await api.get('/skills/360/careers');
    return response.data ?? [];
  },

  async selectTargetCareer(careerId) {
    const response = await api.post('/skills/360/select-career', { career_id: careerId });
    return response.data;
  },

  async fetch360Profile() {
    const response = await api.get('/skills/360/profile');
    return response.data;
  },

  async assessCategory360(data) {
    const response = await api.post('/skills/360/assess-category', data);
    return response.data;
  },

  async completeRoadmapTask(taskId) {
    const response = await api.post(`/skills/360/complete-roadmap-task/${taskId}`);
    return response.data;
  },
};
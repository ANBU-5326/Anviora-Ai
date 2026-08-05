import api from "./api";

export const projectService = {
  getRecommendations: async (params) => {
    const response = await api.get("/projects/recommendations", { params });
    return response.data;
  },
  generateRecommendations: async (userProfile) => {
    const response = await api.post("/projects/generate", userProfile);
    return response.data;
  },
  saveProject: async (project) => {
    const response = await api.post("/projects/saved", project);
    return response.data;
  },
  getSavedProjects: async () => {
    const response = await api.get("/projects/saved");
    return response.data;
  },
  removeSavedProject: async (projectId) => {
    const response = await api.delete(`/projects/saved/${projectId}`);
    return response.data;
  },
  getProjectDetail: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },
};

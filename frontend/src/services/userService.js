import api from "./api";

export const userService = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.post("/users/change-password", data);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get("/users/dashboard-stats");
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete("/users/me");
    return response.data;
  },
};

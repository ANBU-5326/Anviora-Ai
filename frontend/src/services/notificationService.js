import api from "./api";

export const notificationService = {
  getAll: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },
  updatePreferences: async (prefs) => {
    const response = await api.put("/notifications/preferences", prefs);
    return response.data;
  },
};

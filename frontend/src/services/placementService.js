import api from './api';

export const placementService = {
  async getApplications() {
    const response = await api.get('/placements');
    return (response.data || []).map(app => {
      let notes = app.notes;
      let location = "";
      let source = "";
      try {
        const parsed = JSON.parse(app.notes);
        if (parsed && typeof parsed === 'object') {
          notes = parsed.notes || "";
          location = parsed.location || "";
          source = parsed.source || "";
        }
      } catch (_) {
        // Fallback for legacy raw text notes
      }

      return {
        id: app.id,
        company: app.company,
        role: app.role,
        status: app.status,
        date: app.date_applied || "",
        ctc: app.salary || "",
        notes: notes,
        location: location,
        source: source
      };
    });
  },

  async addApplication(app) {
    const serializedNotes = JSON.stringify({
      notes: app.notes || "",
      location: app.location || "",
      source: app.source || ""
    });

    const response = await api.post('/placements', {
      company: app.company,
      role: app.role,
      salary: app.ctc || app.salary || "",
      notes: serializedNotes
    });

    let newApp = response.data;
    if (app.status && app.status !== 'Applied') {
      const updated = await api.put(`/placements/${newApp.id}/status`, { status: app.status });
      newApp = updated.data;
    }

    return {
      id: newApp.id,
      company: newApp.company,
      role: newApp.role,
      status: newApp.status,
      date: newApp.date_applied || "",
      ctc: newApp.salary || "",
      notes: app.notes || "",
      location: app.location || "",
      source: app.source || ""
    };
  },

  async updateApplication(id, app) {
    const serializedNotes = JSON.stringify({
      notes: app.notes || "",
      location: app.location || "",
      source: app.source || ""
    });

    const response = await api.put(`/placements/${id}`, {
      company: app.company,
      role: app.role,
      status: app.status,
      salary: app.ctc || app.salary || "",
      notes: serializedNotes
    });

    const updated = response.data;
    return {
      id: updated.id,
      company: updated.company,
      role: updated.role,
      status: updated.status,
      date: updated.date_applied || "",
      ctc: updated.salary || "",
      notes: app.notes || "",
      location: app.location || "",
      source: app.source || ""
    };
  },

  async updateStatus(id, newStatus) {
    await api.put(`/placements/${id}/status`, { status: newStatus });
    return this.getApplications();
  },

  async deleteApplication(id) {
    await api.delete(`/placements/${id}`);
    return this.getApplications();
  },

  async savePlacementAdvice(content) {
    const response = await api.post('/placements/advice', { content });
    return response.data;
  },

  async getPlacementAdvice() {
    const response = await api.get('/placements/advice');
    return response.data;
  }
};

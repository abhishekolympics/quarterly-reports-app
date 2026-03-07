import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const reportService = {
  // Get all reports
  getAllReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  // Get single report
  getReport: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  // Create new report
  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  // Generate report with AI
  generateReport: async (id) => {
    const response = await api.post(`/reports/${id}/generate`);
    return response.data;
  },

  // Update report
  updateReport: async (id, reportData) => {
    const response = await api.put(`/reports/${id}`, reportData);
    return response.data;
  },

  // Delete report
  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  // Get report HTML
  getReportHTML: async (id) => {
    const response = await api.get(`/reports/${id}/html`);
    return response.data;
  }
};

export default api;

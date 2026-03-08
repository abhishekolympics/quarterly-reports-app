import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const reportService = {
  // QUARTERLY REPORTS
  
  getAllReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  getReport: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  generateReport: async (id) => {
    const response = await api.post(`/reports/${id}/generate`);
    return response.data;
  },

  updateReport: async (id, reportData) => {
    const response = await api.put(`/reports/${id}`, reportData);
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  getReportHTML: async (id) => {
    const response = await api.get(`/reports/${id}/html`);
    return response.data;
  },

  // ANNUAL REPORTS

  getAllAnnualReports: async () => {
    const response = await api.get('/annual-reports');
    return response.data;
  },

  getAnnualReport: async (id) => {
    const response = await api.get(`/annual-reports/${id}`);
    return response.data;
  },

  createAnnualReport: async (reportData) => {
    const response = await api.post('/annual-reports', reportData);
    return response.data;
  },

  generateAnnualReport: async (id) => {
    const response = await api.post(`/annual-reports/${id}/generate`);
    return response.data;
  },

  deleteAnnualReport: async (id) => {
    const response = await api.delete(`/annual-reports/${id}`);
    return response.data;
  }
};

export default api;
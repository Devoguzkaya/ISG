import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const vehiclesApi = {
  getAll: () => api.get('/vehicles'),
  getOne: (id: number) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: number, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};

export const personnelApi = {
  getAll: () => api.get('/personnel'),
  getOne: (id: number) => api.get(`/personnel/${id}`),
  getHistory: (date: string) => api.get(`/personnel/history?date=${date}`),
  create: (data: any) => api.post('/personnel', data),
  update: (id: number, data: any) => api.put(`/personnel/${id}`, data),
  delete: (id: number) => api.delete(`/personnel/${id}`),
};

export const complianceApi = {
  getExpiringCertificates: (days: number = 30) => api.get(`/compliance/expiring/certificates?days=${days}`),
  getExpiringVehicleDocuments: (days: number = 30) => api.get(`/compliance/expiring/vehicle-documents?days=${days}`),
};

export const checklistsApi = {
  getAll: () => api.get('/checklists'),
  getOne: (id: number) => api.get(`/checklists/${id}`),
  create: (data: any) => api.post('/checklists', data),
  update: (id: number, data: any) => api.put(`/checklists/${id}`, data),
};

export const notesApi = {
  getAll: () => api.get('/notes'),
  create: (data: any) => api.post('/notes', data),
  addComment: (noteId: number, data: any) => api.post(`/notes/${noteId}/comments`, data),
};

export const workStatusApi = {
  getAll: () => api.get('/work-status'),
  toggle: (date: string, workOccurred: boolean) => api.post('/work-status', { date, workOccurred })
};

export const settingsApi = {
  getAll: () => api.get('/settings'),
  update: (data: Record<string, string>) => api.post('/settings', data),
};

export default api;

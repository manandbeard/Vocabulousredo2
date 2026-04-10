import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || '';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vocab_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  signup: (data) => api.post('/api/auth/signup', data).then(r => {
    if (r.data.token) localStorage.setItem('vocab_token', r.data.token);
    return r.data;
  }),
  login: (data) => api.post('/api/auth/login', data).then(r => {
    if (r.data.token) localStorage.setItem('vocab_token', r.data.token);
    return r.data;
  }),
  me: () => api.get('/api/auth/me').then(r => r.data),
  logout: () => api.post('/api/auth/logout').then(r => {
    localStorage.removeItem('vocab_token');
    return r.data;
  }),
};

// Classes
export const classesApi = {
  list: (teacherId) => api.get('/api/classes', { params: teacherId ? { teacher_id: teacherId } : {} }).then(r => r.data),
  get: (id) => api.get(`/api/classes/${id}`).then(r => r.data),
  create: (data) => api.post('/api/classes', data).then(r => r.data),
  enroll: (classId, studentId) => api.post(`/api/classes/${classId}/enroll`, { student_id: studentId }).then(r => r.data),
  students: (classId) => api.get(`/api/classes/${classId}/students`).then(r => r.data),
  joinByCode: (classCode) => api.post('/api/classes/join', { class_code: classCode }).then(r => r.data),
};

// Decks
export const decksApi = {
  list: (params) => api.get('/api/decks', { params }).then(r => r.data),
  get: (id) => api.get(`/api/decks/${id}`).then(r => r.data),
  create: (data) => api.post('/api/decks', data).then(r => r.data),
  delete: (id) => api.delete(`/api/decks/${id}`).then(r => r.data),
};

// Cards
export const cardsApi = {
  listByDeck: (deckId) => api.get(`/api/decks/${deckId}/cards`).then(r => r.data),
  get: (id) => api.get(`/api/cards/${id}`).then(r => r.data),
  create: (deckId, data) => api.post(`/api/decks/${deckId}/cards`, data).then(r => r.data),
  update: (id, data) => api.patch(`/api/cards/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/cards/${id}`).then(r => r.data),
};

// Reviews
export const reviewsApi = {
  submit: (data) => api.post('/api/reviews', data).then(r => r.data),
  dueCards: (studentId, deckId) => api.get(`/api/students/${studentId}/due-cards`, { params: deckId ? { deck_id: deckId } : {} }).then(r => r.data),
  list: (studentId, deckId) => api.get(`/api/students/${studentId}/reviews`, { params: deckId ? { deck_id: deckId } : {} }).then(r => r.data),
};

// Analytics
export const analyticsApi = {
  student: (studentId) => api.get(`/api/analytics/student/${studentId}`).then(r => r.data),
  teacher: (teacherId) => api.get(`/api/analytics/teacher/${teacherId}`).then(r => r.data),
  knowledgeGraph: (studentId) => api.get(`/api/students/${studentId}/knowledge-graph`).then(r => r.data),
  studyTime: (studentId) => api.get(`/api/students/${studentId}/study-time`).then(r => r.data),
  persona: (studentId) => api.get(`/api/students/${studentId}/persona`).then(r => r.data),
  achievements: (studentId) => api.get(`/api/students/${studentId}/achievements`).then(r => r.data),
  studentClasses: (studentId) => api.get(`/api/students/${studentId}/classes`).then(r => r.data),
  teacherMilestones: (teacherId) => api.get(`/api/teacher/${teacherId}/milestones`).then(r => r.data),
  teacherHeatmap: (teacherId) => api.get(`/api/analytics/teacher/${teacherId}/heatmap`).then(r => r.data),
  teacherBottlenecks: (teacherId) => api.get(`/api/analytics/teacher/${teacherId}/bottlenecks`).then(r => r.data),
  researchDecks: (studentId) => api.get(`/api/students/${studentId}/research-decks`).then(r => r.data),
  practiceCards: (studentId, deckId) => api.get(`/api/students/${studentId}/practice-cards/${deckId}`).then(r => r.data),
};

// Blurting
export const blurtingApi = {
  create: (data) => api.post('/api/blurting-sessions', data).then(r => r.data),
  list: (studentId) => api.get(`/api/students/${studentId}/blurting-sessions`).then(r => r.data),
};

export default api;

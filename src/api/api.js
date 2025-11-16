// src/api/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:30083/HMS/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false // using Bearer token approach
});

// Add token automatically to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

/* Auth */
export async function register(payload, role = 'ROLE_ATTENDEE') {
  // backend expects ?role=ROLE_X (your controller uses @RequestParam role)
  const roleQ = role ? `?role=${encodeURIComponent(role)}` : '';
  return api.post(`/auth/register${roleQ}`, payload).then(r => r.data);
}

export async function login(payload) {
  return api.post('/auth/login', payload).then(res => res.data);
}

/* Current user info (useful to decide UI permissions) */
export async function fetchCurrentUser() {
  return api.get('/auth/me').then(res => res.data);
}

/* Events */
export async function fetchEvents() { return api.get('/events').then(r => r.data); }
export async function fetchEvent(id) { return api.get(`/events/${id}`).then(r => r.data); }
export async function createEvent(payload) { return api.post('/events', payload).then(r => r.data); }
export async function updateEvent(id, payload) { return api.put(`/events/${id}`, payload).then(r => r.data); }
export async function deleteEvent(id) { return api.delete(`/events/${id}`).then(r => r.data); }

/* Ticket types (per event) */
export async function fetchTicketTypes(eventId) {
  // if you implement /api/events/{eventId}/ticket-types in backend
  return api.get(`/events/${eventId}/ticket-types`).then(r => r.data);
}

/* Registration / attendees */
export async function registerForEvent(eventId) {
  return api.post(`/events/${eventId}/register`).then(r => r.data);
}
export async function getAttendees(eventId) {
  return api.get(`/events/${eventId}/attendees`).then(r => r.data);
}

/* Bookings (if you add booking endpoints) */
// export async function createBooking(payload) { return api.post('/bookings', payload).then(r => r.data); }

export default api;

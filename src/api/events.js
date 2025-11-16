// src/api/events.js
import api from './api';

export function fetchPublishedEvents() { return api.get('/events').then(res => res.data); }
export function fetchEvent(eventId) { return api.get(`/events/${eventId}`).then(res => res.data); }
export function fetchEventTicketTypes(eventId) { return api.get(`/events/${eventId}/ticket-types`).then(res => res.data); }

export function fetchOrganizerEvents() { return api.get('/organizer/events').then(res => res.data); }
export function createEvent(payload) { return api.post('/events', payload).then(res => res.data); }
export function updateEvent(eventId, payload) { return api.put(`/events/${eventId}`, payload).then(res => res.data); }
export function deleteEvent(eventId) { return api.delete(`/events/${eventId}`).then(res => res.data); }

export function listSessions(eventId) { return api.get(`/events/${eventId}/sessions`).then(res => res.data); }
export function createSession(eventId, session) { return api.post(`/events/${eventId}/sessions`, session).then(res => res.data); }
export function updateSession(eventId, sessionId, session) { return api.put(`/events/${eventId}/sessions/${sessionId}`, session).then(res => res.data); }
export function deleteSession(eventId, sessionId) { return api.delete(`/events/${eventId}/sessions/${sessionId}`).then(res => res.data); }

export default {
  fetchPublishedEvents, fetchEvent, fetchEventTicketTypes,
  fetchOrganizerEvents, createEvent, updateEvent, deleteEvent,
  listSessions, createSession, updateSession, deleteSession
};

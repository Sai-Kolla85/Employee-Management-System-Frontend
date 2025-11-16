// src/api/bookings.js
import api from "./api";

/**
 * Free booking endpoint (your backend implemented this as /bookings/free)
 * Uses query params eventId & ticketTypeId
 */
export const createFreeBooking = (eventId, ticketTypeId) =>
  api.post(`/bookings/free`, null, { params: { eventId, ticketTypeId } });

/**
 * For paid bookings: create a PENDING booking server-side
 * Endpoint: POST /bookings/create -> returns { bookingId }
 */
export const createPendingBooking = (ticketTypeId, quantity = 1) =>
  api.post("/bookings/create", { ticketTypeId, quantity });

export const getBooking = (bookingId) => api.get(`/bookings/${bookingId}`);

export const createPaymentIntent = (bookingId) =>
  api.post("/payments/create-intent", { bookingId });

/**
 * Dev helper for local testing - marks the booking confirmed (server method present in dev)
 * Remove this in production (use Stripe webhook instead)
 */
export const confirmManual = (bookingId, paymentId) =>
  api.post("/bookings/confirm-manual", { bookingId, paymentId });

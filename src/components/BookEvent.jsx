// src/components/BookEvent.jsx
import React, { useState } from "react";
import {
  createFreeBooking,
  createPendingBooking,
  createPaymentIntent,
  getBooking,
  confirmManual,
} from "../api/bookings";

import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import QRDisplay from "./QRDisplay";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

function StripeCheckout({ bookingId, onConfirmed }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handlePayment(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createPaymentIntent(bookingId);
      const clientSecret = res.data.clientSecret;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      // For local dev: call manual confirm (replace with webhook in prod)
      await confirmManual(bookingId, result.paymentIntent.id);

      const bookingRes = await getBooking(bookingId);
      onConfirmed(bookingRes.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Payment error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handlePayment}>
      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
        <CardElement />
      </div>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      <button style={{ marginTop: 12 }} disabled={!stripe || loading} type="submit">
        {loading ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
}

export default function BookEvent({ eventId, ticketType }) {
  const [qty, setQty] = useState(1);
  const [stage, setStage] = useState("idle"); // idle, payment, confirmed
  const [booking, setBooking] = useState(null);
  const price = ticketType?.price ?? 0;

  async function reserve() {
    try {
      if (price === 0) {
        // free booking
        const res = await createFreeBooking(eventId, ticketType.id);
        // Some backends return booking object; if yours returns id adapt accordingly
        setBooking(res.data);
        setStage("confirmed");
      } else {
        const res = await createPendingBooking(ticketType.id, qty);
        setStage("payment");
        setBooking({ id: res.data.bookingId });
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Reservation failed");
    }
  }

  async function onConfirmed(confirmedBooking) {
    setBooking(confirmedBooking);
    setStage("confirmed");
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div>
          <strong>{ticketType.name}</strong>
          <div style={{ fontSize: 12, color: "#666" }}>{ticketType.description}</div>
        </div>

        <div>
          <label style={{ fontSize: 13 }}>Qty</label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            style={{ width: 64, marginLeft: 6 }}
          />
        </div>

        <div>
          <button onClick={reserve} disabled={stage !== "idle"}>
            {price === 0 ? "Reserve" : "Reserve & Pay"}
          </button>
        </div>
      </div>

      {stage === "payment" && booking?.id && (
        <div style={{ marginTop: 12 }}>
          <Elements stripe={stripePromise}>
            <StripeCheckout bookingId={booking.id} onConfirmed={onConfirmed} />
          </Elements>
        </div>
      )}

      {stage === "confirmed" && booking && (
        <div style={{ marginTop: 12 }}>
          <h4>Booking confirmed</h4>
          <p>Booking id: {booking.id}</p>
          <QRDisplay value={booking.qrPayload || booking.ticketCode || booking.qrPayload} />
        </div>
      )}
    </div>
  );
}

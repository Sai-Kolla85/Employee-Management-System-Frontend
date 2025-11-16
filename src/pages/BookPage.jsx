// src/pages/BookPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEvent } from "../api/api"; // your existing api wrapper
import { fetchEventTicketTypes } from "../api/events"; // from earlier events.js
import BookEvent from "../components/BookEvent";

export default function BookPage() {
  const { eventId } = useParams(); // route: /book/:eventId
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const ev = await fetchEvent(eventId);
        setEvent(ev);
        const tt = await fetchEventTicketTypes(eventId);
        setTickets(tt.data || tt); // handle different shapes
      } catch (err) {
        console.error(err);
      }
    })();
  }, [eventId]);

  if (!event) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Book: {event.title || event.name}</h2>
      <p>{event.description}</p>

      <h3>Ticket types</h3>
      {tickets.length === 0 ? (
        <p>No ticket types</p>
      ) : (
        tickets.map((t) => (
          <div key={t.id} style={{ borderBottom: "1px solid #eee", padding: 12 }}>
            <BookEvent eventId={event.id} ticketType={t} />
          </div>
        ))
      )}
    </div>
  );
}

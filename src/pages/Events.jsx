// src/pages/Events.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPublishedEvents } from "../api/events";
import EventCard from "../components/EventCard";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchPublishedEvents();
        setEvents(res.data ?? res ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleDeleted(id) {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Events</h1>

      {loading ? (
        <p>Loading events…</p>
      ) : events.length === 0 ? (
        <p>No events yet</p>
      ) : (
        events.map((e) => (
          <div key={e.id} style={{ borderBottom: "1px solid #eee", padding: 12 }}>
            <Link to={`/events/${e.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <h3>{e.title || e.name}</h3>
            </Link>
            <p style={{ color: "#555" }}>{e.description?.slice(0, 200)}</p>

            {/* show full card controls (edit/delete/register) below the summary */}
            <div style={{ marginTop: 8 }}>
              <EventCard event={e} onDeleted={handleDeleted} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { fetchEvents } from '../api/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchEvents().then(setEvents).catch(e => setErr(e.message || 'Failed to load'));
  }, []);

  return (
    <div>
      <h2>Organizer Dashboard</h2>
      <p><Link to="/organizer/new" className="btn">Create new event</Link></p>
      {err && <div className="error">{err}</div>}
      <div className="grid">
        {events.map(ev => (
          <div className="card small" key={ev.id}>
            <h3>{ev.title}</h3>
            <p>{ev.venue}</p>
            <p>Published: {ev.published ? 'Yes' : 'No'}</p>
            <div style={{display:'flex', gap:8}}>
              <button className="btn small">Attendees</button>
              <button className="btn small">Export</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

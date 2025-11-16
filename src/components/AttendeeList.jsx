import React, { useEffect, useState } from 'react';
import { getAttendees } from '../api/api';

export default function AttendeeList({ eventId }) {
  const [attendees, setAttendees] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    getAttendees(eventId)
      .then(data => setAttendees(data))
      .catch(err => {
        console.error('Failed fetch attendees', err);
        alert('Could not load attendees: ' + (err?.response?.data || err?.message));
        setAttendees([]);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div>Loading attendees…</div>;
  if (!attendees || attendees.length === 0) return <div>No attendees yet.</div>;

  return (
    <div>
      <h4 className="font-semibold mb-2">Attendees ({attendees.length})</h4>
      <ul>
        {attendees.map(a => (
          <li key={a.userId} className="py-1 border-b">
            <div className="font-medium">{a.fullName || a.email}</div>
            <div className="text-sm text-gray-600">Registered: {new Date(a.registeredAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

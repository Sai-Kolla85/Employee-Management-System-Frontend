import React, { useEffect, useState } from 'react';
import { fetchPublishedEvents, fetchOrganizerEvents } from '../api/events';
import EventCard from '../components/EventCard';
import { useAuth } from '../auth/AuthProvider';
import { useLocation } from 'react-router-dom';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth?.() || {};
  const location = useLocation();

  useEffect(() => {
    setLoading(true);

    const loader = async () => {
      try {
        let data;
        if (user && (user.roles?.includes('ORGANIZER') || user.roles?.includes('ADMIN'))) {
          data = await fetchOrganizerEvents();
        } else {
          data = await fetchPublishedEvents();
        }
        const payload = data?.data ?? data;
        setEvents(payload || []);
      } catch (err) {
        console.error('Error loading events', err);
        alert('Could not load events: ' + (err?.response?.data || err?.message));
      } finally {
        setLoading(false);
      }
    };

    loader();
  }, [user, location.search]); // <-- re-fetch when query string changes

  function handleDeleted(id) {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  if (loading) return <div>Loading events…</div>;
  if (!events.length) return <div>No events yet.</div>;

  return (
    <div>
      <h2 className="text-2xl mb-4">Events</h2>
      {events.map(e => <EventCard key={e.id} event={e} onDeleted={handleDeleted} />)}
    </div>
  );
}

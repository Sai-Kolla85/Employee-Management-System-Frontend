import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterButton from './RegisterButton';
import AttendeeList from './AttendeeList';
import { AuthContext } from '../auth/AuthProvider';
import { deleteEvent } from '../api/events';
import { formatTimeRange } from '../utils/formatDateTime';

export default function EventCard({ event, onDeleted }) {
  const [showAttendees, setShowAttendees] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useContext(AuthContext);
  const nav = useNavigate();

  // role checks
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');
  const isOrganizer = user?.roles?.includes('ROLE_ORGANIZER') || user?.roles?.includes('ORGANIZER');
  const canViewAttendees = isAdmin || isOrganizer;
  const canRegister = !(isAdmin || isOrganizer); // only attendees can register

  // allow edit/delete only to admin OR organizer who owns this event.
  const isOwner = isOrganizer && event?.organizer?.email && event.organizer.email === user?.email;
  const canEditOrDelete = isAdmin || isOwner;

  const handleEdit = () => {
    nav(`/events/edit/${event.id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete event "${event.title}"? This cannot be undone.`)) return;
    try {
      await deleteEvent(event.id);
      alert('Event deleted');
      if (onDeleted) onDeleted(event.id);
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete event: ' + (err?.response?.data || err?.message || 'Unknown'));
    }
  };

  // backend may use startTime/endTime or startAt/endAt — support both
  const start = event.startTime ?? event.startAt ?? null;
  const end = event.endTime ?? event.endAt ?? null;

  return (
    <div className="card p-4 rounded shadow-sm mb-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 className="text-xl font-bold" style={{ marginBottom: 6 }}>{event.title}</h3>
          {event.description && <p style={{ marginTop: 0, color: '#555' }}>{event.description}</p>}

          {/* location */}
          {event.location && <div style={{ marginTop: 8, color: '#666' }}>{event.location}</div>}

          {/* time range */}
          {(start || end) && (
            <div style={{ marginTop: 8, color: '#222', fontWeight: 600 }}>
              {formatTimeRange(start, end)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <button onClick={() => nav(`/events/${event.id}`)} className="px-3 py-1 border rounded">View</button>

          <div style={{ display: 'flex', gap: 8 }}>
            {canRegister && (
              <RegisterButton
                eventId={event.id}
                onRegistered={() => setRefreshKey(k => k + 1)}
              />
            )}

            {canViewAttendees && (
              <button
                onClick={() => setShowAttendees(s => !s)}
                className="px-3 py-1 border rounded"
              >
                {showAttendees ? 'Hide Attendees' : 'View Attendees'}
              </button>
            )}

            {canEditOrDelete && (
              <>
                <button onClick={handleEdit} className="px-3 py-1 border rounded">
                  Edit
                </button>
                <button onClick={handleDelete} className="px-3 py-1 border rounded text-red-600">
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showAttendees && canViewAttendees && (
        <div className="mt-4">
          <AttendeeList key={refreshKey} eventId={event.id} />
        </div>
      )}
    </div>
  );
}

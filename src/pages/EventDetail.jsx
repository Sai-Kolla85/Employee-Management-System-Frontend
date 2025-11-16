import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEvent, listSessions, createSession, updateSession, deleteSession } from '../api/events';
import SessionForm from '../components/SessionForm';
import { useAuth } from '../auth/AuthProvider';
import { formatTimeRange, formatDateTime } from '../utils/formatDateTime';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth?.() || {};

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const e = await fetchEvent(id);
        if (!mounted) return;
        setEvent(e);

        // sessions may be in a separate endpoint or inside event; try separate then fallback
        try {
          const s = await listSessions(id);
          if (!mounted) return;
          setSessions(s || []);
        } catch (sessErr) {
          console.warn('listSessions failed, falling back to event.sessions', sessErr);
          if (e?.sessions) setSessions(e.sessions);
        }
      } catch (err) {
        console.error('Failed loading event detail', err);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  async function handleCreate(sd) {
    try {
      const payload = {
        ...sd,
        startTime: sd.startTime?.length === 16 ? sd.startTime + ':00' : sd.startTime,
        endTime: sd.endTime?.length === 16 ? sd.endTime + ':00' : sd.endTime
      };
      const created = await createSession(id, payload);
      setSessions(prev => [...prev, created]);
      setShowCreate(false);
    } catch (err) {
      console.error('create session failed', err);
      alert('Failed to create session');
    }
  }

  async function handleUpdate(sessionId, sd) {
    try {
      const payload = {
        ...sd,
        startTime: sd.startTime?.length === 16 ? sd.startTime + ':00' : sd.startTime,
        endTime: sd.endTime?.length === 16 ? sd.endTime + ':00' : sd.endTime
      };
      const updated = await updateSession(id, sessionId, payload);
      setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update session');
    }
  }

  async function handleDelete(sessionId) {
    if (!window.confirm('Delete this session?')) return;
    try {
      await deleteSession(id, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete session');
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!event) return <div style={{ padding: 20 }}>Event not found</div>;

  const title = event.title || event.name;
  const isOrganizer = user && (user.roles?.includes('ORGANIZER') || user.roles?.includes('ROLE_ORGANIZER') || user.roles?.includes('ADMIN') || user.roles?.includes('ROLE_ADMIN'));
  const start = event.startTime ?? event.startAt ?? null;
  const end = event.endTime ?? event.endAt ?? null;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 32, marginBottom: 6 }}>{title}</h2>
          {event.location && <div style={{ color: '#666' }}>{event.location}</div>}
          {(start || end) && (
            <div style={{ marginTop: 8, fontWeight: 600 }}>{formatTimeRange(start, end)}</div>
          )}
          {event.description && <div style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{event.description}</div>}
        </div>

        <div style={{ textAlign: 'right' }}>
          <Link to="/events" className="btn link">Back to events</Link>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 12 }}>Schedule / Sessions</h3>

        {sessions.length === 0 && <div>No sessions yet.</div>}

        {sessions.map(s => {
          const sStart = s.startTime ?? s.startAt ?? null;
          const sEnd = s.endTime ?? s.endAt ?? null;
          return (
            <div key={s.id ?? `${s.title}-${sStart}`} style={{ border: '1px solid #eee', padding: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: 16 }}>{s.title}</strong>
                  {s.speaker && <span style={{ color: '#666', marginLeft: 8 }}> — {s.speaker}</span>}
                  <div style={{ marginTop: 6, color: '#333' }}>{formatTimeRange(sStart, sEnd)}</div>
                  {s.location && <div style={{ marginTop: 6, color: '#666' }}>{s.location}</div>}
                  {s.description && <div style={{ marginTop: 8 }}>{s.description}</div>}
                </div>

                {isOrganizer && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={() => setEditing(s)}>Edit</button>
                    <button onClick={() => handleDelete(s.id)} style={{ color: 'red' }}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div style={{ marginTop: 12 }}>
          <h4>Edit Session</h4>
          <SessionForm initial={{
            ...editing,
            // SessionForm expects datetime-local (YYYY-MM-DDTHH:MM)
            startTime: editing.startTime ? editing.startTime.slice(0,16) : (editing.startAt ? editing.startAt.slice(0,16) : ''),
            endTime: editing.endTime ? editing.endTime.slice(0,16) : (editing.endAt ? editing.endAt.slice(0,16) : '')
          }} onCancel={() => setEditing(null)} onSave={(data) => handleUpdate(editing.id, data)} />
        </div>
      )}

      {isOrganizer && (
        <div style={{ marginTop: 16 }}>
          {!showCreate ? (
            <button onClick={() => setShowCreate(true)}>Add new session</button>
          ) : (
            <SessionForm onCancel={() => setShowCreate(false)} onSave={handleCreate} />
          )}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h3>Tickets</h3>
        {/* TODO: render tickets if your API provides them */}
      </div>
    </div>
  );
}

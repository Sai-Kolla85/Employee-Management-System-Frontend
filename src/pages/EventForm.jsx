import React, { useEffect, useState, useRef } from 'react';
import { createEvent, updateEvent, fetchEvent, listSessions, createSession } from '../api/events';
import { useNavigate, useParams } from 'react-router-dom';
import SessionForm from '../components/SessionForm';

export default function EventForm() {
  const { id } = useParams();
  const eventId = id ? Number(id) : null;
  const isEdit = !!eventId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [sessionsLocal, setSessionsLocal] = useState([]);
  const [editingSessionIndex, setEditingSessionIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  const submitGuard = useRef(false);
  const nav = useNavigate();

  const toInputDT = (val) => {
    if (!val) return '';
    // API returns ISO like 2025-09-25T18:00:00 -> datetime-local needs 2025-09-25T18:00
    if (typeof val === 'string' && val.length >= 16) return val.slice(0, 16);
    return String(val);
  };
  const toBackendDT = (val) => {
    if (!val) return null;
    // datetime-local gives "YYYY-MM-DDTHH:MM" — add seconds for backend LocalDateTime if needed
    return (val.length === 16) ? (val + ':00') : val;
  };

  useEffect(() => {
    if (!isEdit) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const ev = await fetchEvent(eventId);
        if (!mounted) return;
        setTitle(ev.title || '');
        setDescription(ev.description || '');
        setLocation(ev.location || '');
        setStartAt(toInputDT(ev.startTime || ev.startAt || ''));
        setEndAt(toInputDT(ev.endTime || ev.endAt || ''));

        try {
          const sessions = await listSessions(eventId);
          setSessionsLocal((sessions || []).map(s => ({
            ...s,
            startTime: toInputDT(s.startTime),
            endTime: toInputDT(s.endTime)
          })));
        } catch (sErr) {
          console.warn('listSessions failed', sErr);
        }
      } catch (e) {
        console.error('Failed to fetch event', e);
        setErr('Failed to load event for editing');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId, isEdit]);

  async function addLocalSession(session) {
    if (isEdit) {
      try {
        const payload = {
          title: session.title,
          description: session.description,
          speaker: session.speaker,
          startTime: toBackendDT(session.startTime),
          endTime: toBackendDT(session.endTime),
          location: session.location
        };
        const created = await createSession(eventId, payload);
        setSessionsLocal(prev => [...prev, {
          ...created,
          startTime: toInputDT(created.startTime),
          endTime: toInputDT(created.endTime)
        }]);
      } catch (err) {
        console.error('Failed to create session immediately', err);
        alert('Could not save session. Check console for details.');
      }
    } else {
      setSessionsLocal(prev => [...prev, session]);
    }
  }

  function saveEditedLocal(session) {
    if (editingSessionIndex == null) return;
    setSessionsLocal(prev => prev.map((s,i) => i === editingSessionIndex ? { ...s, ...session } : s));
    setEditingSessionIndex(null);
  }

  function removeLocalSession(idx) {
    setSessionsLocal(prev => prev.filter((_,i) => i !== idx));
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    if (submitGuard.current) {
      console.warn('Submit ignored because submitGuard is active');
      return;
    }
    submitGuard.current = true;
    setSaving(true);
    setErr('');
    console.log('handleSubmit invoked (guard engaged)');

    try {
      const payload = {
        title,
        description,
        location,
        startTime: toBackendDT(startAt),
        endTime: toBackendDT(endAt),
        published: true
      };

      let savedEvent;
      if (isEdit) {
        savedEvent = await updateEvent(eventId, payload);
      } else {
        savedEvent = await createEvent(payload);
      }

      // Expect savedEvent to be the saved event object (api returns res.data)
      const finalId = savedEvent?.id;
      const ownerEventId = finalId || eventId;
      if (!ownerEventId) {
        setErr('Event saved but server did not return an id. Check server response in console.');
        console.warn('Unexpected save response:', savedEvent);
        return;
      }

      // Create sessions that don't have an id yet
      const sessionsToCreate = sessionsLocal.filter(s => !s.id);
      if (sessionsToCreate.length) {
        const createdResults = await Promise.all(sessionsToCreate.map(async s => {
          const sp = {
            title: s.title,
            description: s.description,
            speaker: s.speaker,
            startTime: toBackendDT(s.startTime),
            endTime: toBackendDT(s.endTime),
            location: s.location
          };
          try {
            const created = await createSession(ownerEventId, sp);
            return created;
          } catch (err) {
            console.warn('createSession failed for session', s, err);
            return null;
          }
        }));

        const createdNonNull = createdResults.filter(Boolean);
        if (createdNonNull.length) {
          try {
            const reloaded = await listSessions(ownerEventId);
            setSessionsLocal((reloaded || []).map(s => ({ ...s, startTime: toInputDT(s.startTime), endTime: toInputDT(s.endTime) })));
          } catch (reloadErr) {
            setSessionsLocal(prev => [
              ...prev.filter(s => s.id),
              ...createdNonNull.map(c => ({ ...c, startTime: toInputDT(c.startTime), endTime: toInputDT(c.endTime) }))
            ]);
          }
        }
      }

      // Redirect to events listing so the user sees the updated list
      // Simple navigate:
      nav('/events');

      // If your Events page sometimes doesn't re-fetch on mount, use:
      // nav(`/events?updated=${Date.now()}`, { replace: true });

    } catch (err) {
      console.error('handleSubmit error', err);
      const serverMessage = err?.response?.data?.message ?? err?.response?.data ?? err?.message;
      setErr(serverMessage || 'Save event failed');
    } finally {
      setSaving(false);
      submitGuard.current = false;
      console.log('handleSubmit finished (guard released)');
    }
  }

  if (loading) return <div style={{padding: 20}}>Loading...</div>;

  return (
    <div className="card">
      <h2>{isEdit ? 'Edit Event' : 'Create Event'}</h2>
      {err && <div style={{ color: 'red' }}>{String(err)}</div>}
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />

        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />

        <label>Location</label>
        <input value={location} onChange={e => setLocation(e.target.value)} />
        <label>Reminder (minutes before start)</label>



        <label>Start time</label>
        <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} />

        <label>End time</label>
        <input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} />

        <div style={{ border: '1px solid #eee', padding: 12, marginTop: 12 }}>
          <h4>Sessions / Agenda</h4>
          {sessionsLocal.length === 0 && <p>No sessions added yet. Use the form below to add.</p>}
          {sessionsLocal.map((s, idx) => (
            <div key={idx} style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
              <strong>{s.title}</strong> — {s.speaker} <br/>
              {s.startTime} → {s.endTime} @ {s.location}
              <div style={{ marginTop: 6 }}>
                <button type="button" onClick={() => setEditingSessionIndex(idx)}>Edit</button>
                <button type="button" onClick={() => removeLocalSession(idx)} style={{ marginLeft: 8 }}>Remove</button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 12 }}>
            {editingSessionIndex != null ? (
              <SessionForm initial={sessionsLocal[editingSessionIndex]} onCancel={() => setEditingSessionIndex(null)} onSave={saveEditedLocal} />
            ) : (
              <SessionForm onSave={data => addLocalSession(data)} />
            )}
          </div>
        </div>

        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create')}
        </button>
      </form>
    </div>
  );
}

// src/components/SessionForm.jsx
import React, { useState, useEffect } from 'react';

/*
  SessionForm (final)
  - Not a <form> (no nested form problems).
  - Has accessibility attributes (id/name).
  - Strong inline styles to avoid invisible-text problems.
  - onSave receives a session object; if editing, keep `id` in payload.
*/

export default function SessionForm({ initial = {}, onSave, onCancel }) {
  // helper: trim initial ISO to datetime-local (YYYY-MM-DDTHH:mm)
  const normalizeForInput = (val) => {
    if (!val) return '';
    if (typeof val === 'string') {
      // accept strings like "2025-09-20T09:00:00" or "2025-09-20T09:00"
      return val.length >= 16 ? val.slice(0, 16) : val;
    }
    return '';
  };

  const [title, setTitle] = useState(initial.title || '');
  const [speaker, setSpeaker] = useState(initial.speaker || '');
  const [startTime, setStartTime] = useState(normalizeForInput(initial.startTime));
  const [endTime, setEndTime] = useState(normalizeForInput(initial.endTime));
  const [location, setLocation] = useState(initial.location || '');
  const [description, setDescription] = useState(initial.description || '');

  // Only resync when the unique id changes (prevents accidental resets while typing)
  useEffect(() => {
    setTitle(initial.title || '');
    setSpeaker(initial.speaker || '');
    setStartTime(normalizeForInput(initial.startTime));
    setEndTime(normalizeForInput(initial.endTime));
    setLocation(initial.location || '');
    setDescription(initial.description || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  function handleSave() {
    const payload = {
      // keep id if editing
      ...(initial.id ? { id: initial.id } : {}),
      title: title.trim(),
      speaker: speaker.trim(),
      startTime: startTime ? (startTime.length === 16 ? startTime + ':00' : startTime) : null,
      endTime: endTime ? (endTime.length === 16 ? endTime + ':00' : endTime) : null,
      location: location.trim(),
      description: description.trim()
    };
    onSave && onSave(payload);
  }

  // Inline input style - explicit to avoid invisible text / caret
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #dfe6f0',
    boxSizing: 'border-box',
    color: '#0f172a',         // ensure visible text
    background: '#ffffff',    // ensure visible background
    caretColor: '#0f172a',
    fontSize: '1rem'
  };

  const labelStyle = { display: 'block', marginTop: 10, marginBottom: 6, color: '#374151', fontSize: '0.95rem' };

  return (
    <div style={{ marginBottom: 12 }}>
      <div>
        <label htmlFor="session-title" style={labelStyle}>Title</label>
        <input
          id="session-title"
          name="title"
          placeholder="Enter session title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={inputStyle}
          aria-label="Session title"
          required
        />
      </div>

      <div>
        <label htmlFor="session-speaker" style={labelStyle}>Speaker</label>
        <input
          id="session-speaker"
          name="speaker"
          placeholder="Enter speaker name (optional)"
          value={speaker}
          onChange={e => setSpeaker(e.target.value)}
          style={inputStyle}
          aria-label="Session speaker"
        />
      </div>

      <div>
        <label htmlFor="session-start" style={labelStyle}>Start (YYYY-MM-DDTHH:mm)</label>
        <input
          id="session-start"
          name="startTime"
          type="datetime-local"
          placeholder="Start time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          style={inputStyle}
          aria-label="Session start time"
        />
      </div>

      <div>
        <label htmlFor="session-end" style={labelStyle}>End (YYYY-MM-DDTHH:mm)</label>
        <input
          id="session-end"
          name="endTime"
          type="datetime-local"
          placeholder="End time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          style={inputStyle}
          aria-label="Session end time"
        />
      </div>

      <div>
        <label htmlFor="session-location" style={labelStyle}>Location</label>
        <input
          id="session-location"
          name="location"
          placeholder="Session location (optional)"
          value={location}
          onChange={e => setLocation(e.target.value)}
          style={inputStyle}
          aria-label="Session location"
        />
      </div>

      <div>
        <label htmlFor="session-description" style={labelStyle}>Description</label>
        <textarea
          id="session-description"
          name="description"
          placeholder="Short description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
          aria-label="Session description"
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" onClick={handleSave} style={{ padding: '8px 12px', marginRight: 8 }} aria-label="Save session">
          Save Session
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ padding: '8px 12px' }} aria-label="Cancel session edit">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

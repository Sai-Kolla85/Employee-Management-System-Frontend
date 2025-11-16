// src/pages/CreateEvent.jsx
import React, { useState } from 'react';
import api from '../api/api';

function toLocalDateTimeString(date) {
  const pad = n => String(n).padStart(2,'0');
  const Y = date.getFullYear();
  const M = pad(date.getMonth()+1);
  const D = pad(date.getDate());
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${Y}-${M}-${D}T${h}:${m}:${s}`; // "2025-09-18T18:00:00"
}

export default function CreateEvent({ navigateTo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(''); // yyyy-mm-dd
  const [startTime, setStartTime] = useState(''); // HH:MM
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // Build Date objects from date+time inputs
      const s = new Date(`${startDate}T${startTime}:00`);
      const eDate = new Date(`${endDate}T${endTime}:00`);

      const payload = {
        title,
        description,
        location,               // EXACT name expected by backend
        startTime: toLocalDateTimeString(s),
        endTime: toLocalDateTimeString(eDate),
        published: true
      };

      // Debug: open console to verify payload before sending
      console.log("POST /api/events payload:", payload);

      const res = await api.post('/events', payload);
      console.log('create response', res.data);

      // navigate to new event page (adjust to your router)
      if (res.data && res.data.id) {
        window.location.href = `/events/${res.data.id}`;
      } else {
        // If backend returns created entity in response body, use it. Otherwise fetch detail.
        window.location.href = '/events';
      }
    } catch (err) {
      console.error(err);
      // Show helpful message
      setError(err.response?.data?.message || err.message || 'Create failed');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required/>
      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" />
      <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Venue / Location" />

      <label>Start</label>
      <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} required/>
      <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} required/>

      <label>End</label>
      <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} required/>
      <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} required/>

      <button type="submit">Create</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}

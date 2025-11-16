// src/pages/Register.jsx
import React, { useState } from 'react';
import { register } from '../api/api';
import { useNavigate } from 'react-router-dom';

const ROLE_OPTIONS = [
  { label: 'Attendee', value: 'ROLE_ATTENDEE' },
  { label: 'Organizer', value: 'ROLE_ORGANIZER' },
  { label: 'Admin (dev only)', value: 'ROLE_ADMIN' } // dev only - remove in production
];

export default function Register() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_ATTENDEE');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const payload = { email, password, fullName };
      const res = await register(payload, role);
      // res: { token, role } — registration returns token and role in your backend
      alert('Registered successfully. Please login (or you may already be logged in if token returned).');
      nav('/login');
    } catch (error) {
      setErr(error?.response?.data?.message || error.message || 'Registration failed');
    }
  }

  return (
    <div style={{maxWidth:480, margin:"2rem auto"}}>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label><br/>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label>Full name</label><br/>
          <input value={fullName} onChange={e=>setFullName(e.target.value)} required />
        </div>
        <div>
          <label>Password</label><br/>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        </div>
        <div>
          <label>Role</label><br/>
          <select value={role} onChange={e=>setRole(e.target.value)}>
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div style={{fontSize:12, color:'#666'}}>Note: Admin option is for dev only — do not expose in production.</div>
        </div>
        <div style={{marginTop:10}}>
          <button type="submit">Register</button>
        </div>
      </form>
      {err && <div style={{color:'red'}}>{err}</div>}
    </div>
  );
}

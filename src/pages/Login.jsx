// src/pages/Login.jsx
import React, { useState } from 'react';
import { login } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Login() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');
  const nav = useNavigate();
  const { loginWithToken } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const data = await login({ email, password });
      // expected data: { token, role }
      if (!data || !data.token) throw new Error('No token returned');
      loginWithToken(data.token, data.role, null, email);
      nav('/');
    } catch (error) {
      setErr(error?.response?.data?.message || error.message || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email</label><br/>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label>Password</label><br/>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        </div>
        <div style={{marginTop:10}}>
          <button type="submit">Login</button>
        </div>
      </form>
      {err && <div style={{color:'red'}}>{err}</div>}
    </div>
  );
}

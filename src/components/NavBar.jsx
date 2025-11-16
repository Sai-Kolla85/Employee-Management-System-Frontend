import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function NavBar() {
  const { user, logout, hasRole } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="brand">EMS</Link>
        <Link to="/events">Events</Link>
        {user && hasRole(['ROLE_ORGANIZER','ROLE_ADMIN']) && <Link to="/dashboard">Dashboard</Link>}
      </div>

      <div className="nav-right">
        {!user && <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>}
        {user && <>
          <span className="muted">{user.email}</span>
          <button className="btn link" onClick={handleLogout}>Logout</button>
        </>}
      </div>
    </nav>
  );
}

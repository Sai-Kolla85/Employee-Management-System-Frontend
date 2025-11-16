import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Event Management System</h1>
      <p>Welcome — browse public events or login to create/manage events.</p>
      <p><Link to="/events">See all events</Link></p>
    </div>
  );
}

// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';
import BookPage from './pages/BookPage';
import CreateEvent from './pages/CreateEvent';
import EventForm from './pages/EventForm';

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
      <Route path="/book/:eventId" element={<BookPage />} />
      <Route path="/organizer/new" element={<CreateEvent />} />
      <Route path="/events/create" element={<EventForm />} />
      <Route path="/events/edit/:id" element={<EventForm />} />
          {/* Protected routes example */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['ROLE_ORGANIZER', 'ROLE_ADMIN']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}


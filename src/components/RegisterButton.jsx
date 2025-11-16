import React, { useEffect, useState, useContext } from 'react';
import api, { registerForEvent } from '../api/api';
import QRViewer from './QRViewer';
import { AuthContext } from '../auth/AuthProvider';

export default function RegisterButton({ eventId, onRegistered }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [freeTicketTypeId, setFreeTicketTypeId] = useState(null);
  const [qrBase64, setQrBase64] = useState(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    let mounted = true;

    // 1) check registration status (backend returns { registered: boolean })
    api.get(`/events/${eventId}/status`)
      .then(res => {
        if (!mounted) return;
        const data = res.data ?? res;
        console.log('[status]', data);
        setRegistered(Boolean(data.registered));
      })
      .catch(e => {
        console.warn('status check failed', e);
        setRegistered(false);
      });

    // 2) fetch ticket types for event to find free ticket
    api.get(`/events/${eventId}/ticket-types`)
      .then(res => {
        if (!mounted) return;
        const types = res.data ?? res;
        console.log('[ticket-types]', types);
        if (Array.isArray(types)) {
          const free = types.find(t => t.price == null || Number(t.price) === 0);
          if (free) setFreeTicketTypeId(free.id);
          else setFreeTicketTypeId(null);
        } else {
          setFreeTicketTypeId(null);
        }
      })
      .catch(err => {
        console.warn('ticket types fetch failed', err);
        setFreeTicketTypeId(null);
      });

    return () => { mounted = false; };
  }, [eventId]);

  const handleRegister = async () => {
    if (!eventId) return;
    if (!user) {
      alert('Please login to register for this event.');
      return;
    }
    if (registered) {
      alert('You are already registered for this event.');
      return;
    }

    setLoading(true);
    try {
      // 1) Register
      const regResp = await registerForEvent(eventId);
      console.log('[registerResp]', regResp);

      // 2) Try to create booking: if we detected a free ticket, pass it; otherwise call backend without ticketTypeId
      let booking = null;
      try {
        if (freeTicketTypeId) {
          console.log('Creating booking with ticketTypeId', freeTicketTypeId);
          const resp = await api.post(`/bookings/free?eventId=${eventId}&ticketTypeId=${freeTicketTypeId}`);
          booking = resp.data ?? resp;
        } else {
          console.log('No free ticket detected on frontend — asking backend to pick or create booking');
          const resp = await api.post(`/bookings/free?eventId=${eventId}`);
          booking = resp.data ?? resp;
        }
        console.log('[booking]', booking);
      } catch (bkErr) {
        console.warn('booking creation failed', bkErr);
      }

      // 3) If booking created, fetch QR
      if (booking && booking.id) {
        try {
          const qrResp = await api.get(`/bookings/${booking.id}/qrcode`);
          const qrData = qrResp.data ?? qrResp;
          console.log('[qr]', qrData);
          setQrBase64(qrData);
          setShowQr(true);
        } catch (qrErr) {
          console.warn('Failed to fetch QR:', qrErr);
          alert('Registered, but failed to fetch QR code.');
        }
      } else {
        // No booking created
        alert('Registered successfully. (No ticket/booking was created.)');
      }

      setRegistered(true);
      if (onRegistered) onRegistered();
    } catch (err) {
      console.error('Registration/booking error', err);
      const msg = err?.response?.data || err?.message || 'Registration failed';
      alert('Error: ' + (typeof msg === 'string' ? msg : JSON.stringify(msg)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleRegister}
        disabled={loading || registered}
        className={`px-3 py-1 rounded text-white ${registered ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'}`}
      >
        {loading ? 'Processing…' : (registered ? 'Already registered' : 'Register')}
      </button>

      {showQr && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => { setShowQr(false); setQrBase64(null); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', padding: 20, borderRadius: 8, textAlign: 'center' }}
          >
            <h3 className="mb-2">Your Ticket</h3>
            <QRViewer base64={qrBase64} />
            <div style={{ marginTop: 12 }}>
              <a
                href={`data:image/png;base64,${qrBase64}`}
                download={`ticket_${eventId}.png`}
                className="px-3 py-1 border rounded"
                onClick={(e) => { /* allow download */ }}
              >
                Download
              </a>
              <button
                onClick={() => { setShowQr(false); setQrBase64(null); }}
                className="ml-3 px-3 py-1 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

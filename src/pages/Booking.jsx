import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { bookFree, getBookingQRCode, fetchEvent } from '../api/api';
import QRViewer from '../components/QRViewer';

export default function Booking() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [ticketTypeId, setTicketTypeId] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [qr, setQr] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchEvent(eventId).then(ev => {
      setEvent(ev);
      if (ev?.ticketTypes?.length) setTicketTypeId(ev.ticketTypes[0].id);
    }).catch(e => setErr(e.message));
  }, [eventId]);

  async function doBook(e) {
    e.preventDefault();
    setErr('');
    try {
      const res = await bookFree(eventId, ticketTypeId, {});
      setBookingId(res.id || res.bookingId);
      const qrData = await getBookingQRCode(res.id || res.bookingId);
      setQr(qrData.base64 || qrData);
    } catch (error) {
      setErr(error?.response?.data?.message || error.message || 'Booking error');
    }
  }

  if (!event) return <div>Loading event...</div>;

  return (
    <div>
      <h2>Book for: {event.title}</h2>
      <form onSubmit={doBook}>
        <label>Ticket Type</label>
        <select value={ticketTypeId || ''} onChange={e=>setTicketTypeId(e.target.value)}>
          {(event.ticketTypes || []).map(tt => (
            <option value={tt.id} key={tt.id}>{tt.name} — {tt.price ? `$${tt.price}` : 'Free'}</option>
          ))}
        </select>
        <button className="btn">Book Now</button>
        {err && <div className="error">{err}</div>}
      </form>

      {bookingId && <div>
        <h3>Your booking ID: {bookingId}</h3>
        <QRViewer base64={qr} />
      </div>}
    </div>
  );
}

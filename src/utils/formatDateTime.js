// src/utils/formatDateTime.js
export function formatDateTime(iso) {
  if (!iso) return '';
  try {
    // Normalize: backend might send "2025-09-25T18:00:00" or with timezone
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);

    // Example formatting: "Thu, Sep 25 • 06:00 PM"
    const options = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return d.toLocaleString(undefined, options).replace(',', ' •');
  } catch (e) {
    return iso;
  }
}

export function formatTimeRange(startIso, endIso) {
  if (!startIso && !endIso) return '';
  if (!startIso) return formatDateTime(endIso);
  if (!endIso) return formatDateTime(startIso);
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (s.toDateString() === e.toDateString()) {
      // same date -> show "Sep 25 • 06:00 PM - 08:00 PM"
      const day = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const startT = s.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      const endT = e.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      return `${day} • ${startT} - ${endT}`;
    } else {
      // different dates -> show both
      return `${formatDateTime(startIso)} — ${formatDateTime(endIso)}`;
    }
  } catch (err) {
    return `${startIso || ''} - ${endIso || ''}`;
  }
}

import React from 'react';

export default function QRViewer({ base64 }) {
  if (!base64) return null;
  const src = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
  return (
    <div style={{ textAlign: 'center', marginTop: 12 }}>
      <img alt="QR Code" src={src} style={{ maxWidth: 300 }} />
    </div>
  );
}

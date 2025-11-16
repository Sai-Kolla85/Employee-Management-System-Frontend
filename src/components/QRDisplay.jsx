// src/components/QRDisplay.jsx
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRDisplay({ value, size = 220 }) {
  if (!value) return null;
  return (
    <div style={{ textAlign: "center", marginTop: 16 }}>
      <h4>Your ticket QR</h4>
      <QRCodeCanvas value={value} size={size} />
      <p style={{ fontSize: 13, color: "#444" }}>
        Save this QR or show it at the entrance.
      </p>
    </div>
  );
}


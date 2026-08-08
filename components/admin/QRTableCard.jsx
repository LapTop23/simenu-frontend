// components/admin/QRTableCard.jsx
'use client';

import { QRCodeSVG } from 'qrcode.react';

/**
 * QRTableCard — one printable card per table, laid out exactly per the
 * requested template:
 *
 *   WELCOME TO / [RESTAURANT NAME] / [QR CODE] / TABLE # 05 /
 *   (Scan to Order) / divider / Powered by SiMenu
 *
 * Uses `qrcode.react`'s SVG renderer (not canvas) specifically because it
 * scales losslessly at print resolution — a canvas-rendered QR code would
 * pixelate once physically printed and enlarged on a table tent.
 */
export default function QRTableCard({ restaurantName, tableNumber, targetUrl }) {
  return (
    <div className="qr-print-card flex flex-col items-center rounded-2xl border border-sand bg-white px-6 py-8 text-center shadow-sm shadow-ink/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/40">Welcome to</p>
      <h2 className="mt-1 font-display text-xl italic leading-tight text-ink">{restaurantName}</h2>

      <div className="my-6 rounded-xl border border-sand p-3">
        <QRCodeSVG value={targetUrl} size={168} bgColor="#ffffff" fgColor="#1B1F1C" level="M" />
      </div>

      <p className="font-mono text-lg font-bold tracking-wide text-ink">
        TABLE # {String(tableNumber).padStart(2, '0')}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink/50">(Scan to Order)</p>

      <div className="my-4 w-full border-t border-dashed border-sand" />

      <p className="text-[10px] tracking-wide text-ink/40">
        Powered by <span className="font-semibold text-ink/60">SiMenu</span>
      </p>
    </div>
  );
}

// components/admin/QRCodeGeneratorPanel.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import QRTableCard from './QRTableCard';
import { fetchTableKeys } from '../../lib/api';

const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://simenu.com';

/**
 * QRCodeGeneratorPanel — owner enters a table count, the panel fetches each
 * table's real, secret key from the backend (owner-only endpoint — see
 * lib/api.js#fetchTableKeys) and generates one unique, secured ordering URL
 * + QR code per table (`?res=<slug>&table=<n>&key=<secret>`). "Print QR
 * Codes" hands the exact same on-screen grid to the browser's print dialog
 * via `window.print()` — no separate print template to keep in sync, since
 * `.qr-print-page`/`.qr-print-card` (see app/globals.css) only change layout
 * rules under `@media print`, they don't duplicate markup.
 */
export default function QRCodeGeneratorPanel({ restaurantSlug, restaurantName }) {
  // Uncommitted (live-typed) count vs. committed (what's actually rendered) —
  // this is a controlled input, but generation is an explicit action rather
  // than regenerating the whole grid on every keystroke.
  const [tableCountInput, setTableCountInput] = useState('12');
  const [committedCount, setCommittedCount] = useState(12);
  const [tableKeys, setTableKeys] = useState({}); // { [tableNumber]: key }
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [keysError, setKeysError] = useState(null);

  useEffect(() => {
    if (!restaurantSlug) return;
    setIsLoadingKeys(true);
    setKeysError(null);

    fetchTableKeys(restaurantSlug, committedCount)
      .then(({ keys }) => {
        const map = {};
        keys.forEach(({ table, key }) => { map[table] = key; });
        setTableKeys(map);
      })
      .catch((err) => setKeysError(err.message || 'Could not load table keys.'))
      .finally(() => setIsLoadingKeys(false));
  }, [restaurantSlug, committedCount]);

  const tableNumbers = useMemo(
    () => Array.from({ length: committedCount }, (_, i) => i + 1),
    [committedCount]
  );

  const buildTableUrl = (tableNumber) =>
    `${SITE_BASE_URL}/menu?res=${encodeURIComponent(restaurantSlug)}&table=${tableNumber}&key=${tableKeys[tableNumber] || ''}`;

  const handleGenerate = (event) => {
    event.preventDefault();
    const parsed = Math.max(1, Math.min(200, Math.floor(Number(tableCountInput)) || 0));
    setCommittedCount(parsed);
    setTableCountInput(String(parsed));
  };

  return (
    <div>
      <div className="no-print flex flex-wrap items-end justify-between gap-4">
        <form onSubmit={handleGenerate} className="flex items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/60">Number of tables</span>
            <input
              type="number"
              min="1"
              max="200"
              value={tableCountInput}
              onChange={(e) => setTableCountInput(e.target.value)}
              className="w-28 rounded-lg border border-sand px-3 py-2 font-mono text-sm text-ink outline-none focus:border-basil"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-basil px-4 py-2 text-sm font-semibold text-paper shadow-sm"
          >
            Generate
          </button>
        </form>

        <button
          type="button"
          onClick={() => window.print()}
          disabled={isLoadingKeys}
          className="rounded-full bg-chili px-5 py-2.5 text-sm font-semibold text-paper shadow-sm shadow-chili/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          🖨 Print QR Codes
        </button>
      </div>

      {keysError && (
        <p className="no-print mt-3 rounded-lg bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{keysError}</p>
      )}

      <p className="no-print mt-2 text-xs text-ink/40">
        Each card carries a hidden, unique security key — reprint a table's code if you ever
        suspect it's been shared or photographed by someone not sitting there.
      </p>

      <div className="qr-print-page mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoadingKeys ? (
          <p className="no-print col-span-full py-12 text-center text-sm text-ink/40">Generating secure table keys…</p>
        ) : (
          tableNumbers.map((tableNumber) => (
            <QRTableCard
              key={tableNumber}
              restaurantName={restaurantName}
              tableNumber={tableNumber}
              targetUrl={buildTableUrl(tableNumber)}
            />
          ))
        )}
      </div>
    </div>
  );
}

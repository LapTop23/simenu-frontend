// components/Header.jsx
'use client';

import LanguageSwitcher from './LanguageSwitcher';

/**
 * Sticky top header: restaurant identity on the left, table number as a
 * mono "ticket stub" pill on the right — reinforces the kitchen-ticket
 * motif that pays off again in the floating cart bar.
 */
export default function Header({ restaurant, tableNumber }) {
  return (
    <header className="sticky top-0 z-30 bg-basil text-paper shadow-md shadow-basil/20">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {restaurant?.branding?.logoUrl ? (
            <img
              src={restaurant.branding.logoUrl}
              alt={`${restaurant.name} logo`}
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover ring-2 ring-saffron/60"
            />
          ) : (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-basil-dark ring-2 ring-saffron/60">
              <span className="font-display text-lg italic text-saffron">
                {restaurant?.name?.charAt(0) ?? 'S'}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg italic leading-tight text-paper">
              <span className="notranslate">{restaurant?.name || 'SiMenu'}</span>
            </h1>
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-paper/60">
              Digital menu
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <LanguageSwitcher />

          {tableNumber && (
            <div className="flex flex-shrink-0 flex-col items-center rounded-lg border border-dashed border-saffron/50 bg-basil-dark px-3 py-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-paper/50">Table</span>
              <span className="font-mono text-sm font-semibold leading-none text-saffron">
                {String(tableNumber).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

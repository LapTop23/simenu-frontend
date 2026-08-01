// components/admin/WorkspaceMenu.jsx
'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * WorkspaceMenu — the "⋮" kebab menu in both the Owner Dashboard and Kitchen
 * Dashboard headers. Replaces what used to be two always-visible buttons
 * ("Switch workspace" / "Log out") with a single compact trigger, matching
 * the more common pattern for secondary/account-level actions.
 *
 * `variant="light"` (white header, e.g. the owner dashboard) vs
 * `variant="dark"` (the kitchen dashboard's dark header) swaps just the
 * trigger button's colors — the dropdown panel itself is always a normal
 * white card, since it's floating above whichever header it came from.
 */
export default function WorkspaceMenu({ restaurantSlug, onLogout, variant = 'light',extraItems = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const triggerClasses =
    variant === 'dark'
      ? 'border-white/20 text-paper/70 hover:text-paper'
      : 'border-sand text-ink/60 hover:text-ink';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="More options"
        aria-expanded={isOpen}
        className={`flex h-8 w-8 items-center justify-center rounded-full border text-lg leading-none transition-colors ${triggerClasses}`}
      >
        ⋮
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-2xl border border-sand bg-white shadow-lg shadow-ink/10">
          {extraItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="block w-full border-b border-sand px-4 py-2.5 text-left text-sm font-medium text-ink hover:bg-paper"
            >
              {item.label}
            </button>
          ))}
          <a
            href={`/portal?res=${restaurantSlug}`}
            className="block px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
          >
            Switch workspace
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="block w-full border-t border-sand px-4 py-2.5 text-left text-sm font-medium text-chili hover:bg-paper"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

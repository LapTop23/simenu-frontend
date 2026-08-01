// lib/theme.js

/**
 * Converts a hex color (e.g. "#1F4D3D" or "#fff") into a space-separated RGB
 * triplet string (e.g. "31 77 61") — the exact format Tailwind's CSS-variable
 * color pattern requires (`rgb(var(--x) / <alpha-value>)`, see
 * tailwind.config.js). Returns null for anything that isn't a valid hex
 * color, so callers can safely fall back to the default rather than setting
 * a broken CSS variable.
 */
export function hexToRgbTriplet(hex) {
  if (!hex || typeof hex !== 'string') return null;

  const normalized = hex.trim().replace('#', '');
  const isShort = normalized.length === 3;
  const isFull = normalized.length === 6;
  if (!isShort && !isFull) return null;
  if (!/^[0-9A-Fa-f]+$/.test(normalized)) return null;

  const expand = (c) => (isShort ? c + c : c);
  const r = parseInt(expand(normalized.slice(0, isShort ? 1 : 2)), 16);
  const g = parseInt(expand(normalized.slice(isShort ? 1 : 2, isShort ? 2 : 4)), 16);
  const b = parseInt(expand(normalized.slice(isShort ? 2 : 4, isShort ? 3 : 6)), 16);

  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return `${r} ${g} ${b}`;
}

/**
 * Darkens an RGB triplet string by a percentage (0-1) — used to derive the
 * "-dark" hover/active variant from a single chosen brand color, since
 * restaurants only pick ONE primary/secondary color each, not a full
 * light/dark pair.
 */
export function darkenRgbTriplet(rgbTriplet, amount = 0.3) {
  const [r, g, b] = rgbTriplet.split(' ').map(Number);
  const darken = (c) => Math.round(Math.max(0, c * (1 - amount)));
  return `${darken(r)} ${darken(g)} ${darken(b)}`;
}

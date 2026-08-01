// components/ThemeColorInjector.jsx
'use client';

import { useEffect } from 'react';
import { hexToRgbTriplet, darkenRgbTriplet } from '../lib/theme';

/**
 * ThemeColorInjector — renders nothing; its only job is a side effect.
 *
 * Reads a restaurant's `branding.primaryColor`/`branding.secondaryColor`
 * (hex strings) and writes them onto `document.documentElement` as CSS
 * variables. Because tailwind.config.js defines `basil`/`saffron` as
 * `rgb(var(--color-basil) / <alpha-value>)` rather than static hex, EVERY
 * existing `bg-basil`, `text-saffron`, `border-basil/40`, etc. class already
 * used throughout the entire codebase automatically picks up the new color —
 * no component needed to change.
 *
 * Mount this once near the top of any page that has restaurant context
 * (customer menu, owner dashboard, kitchen dashboard). Safe to mount on
 * multiple pages simultaneously; each just re-applies the same values.
 */
export default function ThemeColorInjector({ branding }) {
  useEffect(() => {
    const root = document.documentElement;

    const primaryRgb = hexToRgbTriplet(branding?.primaryColor);
    if (primaryRgb) {
      root.style.setProperty('--color-basil', primaryRgb);
      root.style.setProperty('--color-basil-dark', darkenRgbTriplet(primaryRgb, 0.3));
    } else {
      root.style.removeProperty('--color-basil');
      root.style.removeProperty('--color-basil-dark');
    }

    const secondaryRgb = hexToRgbTriplet(branding?.secondaryColor);
    if (secondaryRgb) {
      root.style.setProperty('--color-saffron', secondaryRgb);
      root.style.setProperty('--color-saffron-dark', darkenRgbTriplet(secondaryRgb, 0.15));
    } else {
      root.style.removeProperty('--color-saffron');
      root.style.removeProperty('--color-saffron-dark');
    }

    // Reset to SiMenu's own defaults when navigating away from a
    // restaurant-scoped page (e.g. back to a future marketing site), so one
    // restaurant's colors never "leak" onto an unrelated page.
    return () => {
      root.style.removeProperty('--color-basil');
      root.style.removeProperty('--color-basil-dark');
      root.style.removeProperty('--color-saffron');
      root.style.removeProperty('--color-saffron-dark');
    };
  }, [branding?.primaryColor, branding?.secondaryColor]);

  return null;
}

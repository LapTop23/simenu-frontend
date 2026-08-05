// components/marketing/HeroQRDemo.jsx
'use client';

import { QRCodeSVG } from 'qrcode.react';

const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://simenu.com';
// Points at a real, seeded demo restaurant so a visitor can genuinely scan
// this and use the live product — not a screenshot, not a mockup. Set up a
// restaurant with slug "demo" (see the project README) for this to work;
// until then, it'll show a normal "restaurant not found" page, which is
// still an honest reflection of the real system rather than a fake image.
const DEMO_MENU_URL = `${SITE_BASE_URL}/menu?res=demo&table=1`;

/**
 * HeroQRDemo — the single highest-impact element on the homepage (see the
 * competitive analysis: My Menu / mydigimenu.com does exactly this in their
 * hero, and it's the strongest idea worth borrowing directly). A visitor can
 * scan this with their own phone and land on a REAL, live SiMenu menu within
 * seconds — no video, no screenshot, the actual product.
 */
export default function HeroQRDemo() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-sand bg-white p-6 shadow-lg shadow-ink/10">
      <QRCodeSVG value={DEMO_MENU_URL} size={180} bgColor="#ffffff" fgColor="#1B1F1C" level="M" />
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-ink/50">
        Scan with your phone
      </p>
      <a
        href={DEMO_MENU_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold text-basil hover:underline"
      >
        Or click here to try it right now →
      </a>
    </div>
  );
}

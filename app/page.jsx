// app/page.jsx
//
// Deliberately NOT a 'use client' file — this is the one page on the whole
// site where server-rendered <head> metadata and structured data genuinely
// matter (see the competitive analysis doc, Parts 4 & 5: schema markup is
// described as the single most impactful technical SEO change available,
// and it's what makes AI answer engines treat a business as a "trusted
// entity"). The two interactive pieces (the QR demo, the FAQ accordion) are
// small client components imported below — everything else here renders on
// the server, so search engines and AI crawlers see real content immediately.

import HeroQRDemo from '../components/marketing/HeroQRDemo';
import FAQAccordion from '../components/marketing/FAQAccordion';

const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://simenu.com';

export const metadata = {
  title: 'SiMenu — QR Ordering & Live Kitchen Dashboard for Restaurants',
  description:
    'Give every table a QR code that opens a live, interactive menu. Orders land instantly on your kitchen dashboard — no app to install, no hardware to buy. Free plan available, paid plans from 1,499 PKR/month.',
  keywords: [
    'QR menu Pakistan',
    'restaurant ordering system',
    'digital menu QR code',
    'kitchen display system',
    'restaurant sales analytics',
  ],
  openGraph: {
    title: 'SiMenu — QR Ordering & Live Kitchen Dashboard for Restaurants',
    description: 'Scan, order, and watch it land on the kitchen dashboard instantly. Try the live demo.',
    url: SITE_BASE_URL,
    siteName: 'SiMenu',
    type: 'website',
  },
};

const FEATURES = [
  { icon: '⚡', title: 'Real-time kitchen sync', desc: 'Orders appear on the kitchen dashboard the instant they\'re placed — no refreshing, no shouting across the room.' },
  { icon: '🔒', title: 'Secure table QR codes', desc: 'Every table\'s code carries its own security key and auto-expiring session — no one can order pretending to be a different table.' },
  { icon: '📊', title: 'Sales analytics', desc: 'Revenue, order counts, and your best-selling dishes — right on your own dashboard, updated live.' },
  { icon: '🌐', title: 'Multi-language menu', desc: 'Customers can read your menu in their own language — dish names always stay exactly as you wrote them.' },
  { icon: '🎨', title: 'Your own branding', desc: 'Upload your logo and pick your own colors — your customer menu and dashboards look like YOUR restaurant, not a generic template.' },
  { icon: '💬', title: 'AI menu assistant', desc: 'A built-in chat assistant answers customer questions about your menu — allergens, recommendations, dietary needs — grounded strictly in your real menu.' },
];

const PRICING_TIERS = [
  { name: 'Free', slug: 'free', price: '0', includes: '1 restaurant, 3 tables, QR ordering' },
  { name: 'Starter', slug: 'starter', price: '1,499', includes: 'Core QR ordering, live kitchen dashboard, up to 100 menu items' },
  { name: 'Growth', slug: 'growth', price: '2,499', includes: 'Everything in Starter + sales analytics, size variants, multi-language, dynamic branding', highlighted: true },
  { name: 'Business', slug: 'business', price: '3,999', includes: 'Everything in Growth + header cover image, priority support' },
  { name: 'Premium', slug: 'premium', price: '5,999', includes: 'Everything in Business + AI menu assistant, custom domain' },
];

const FAQ_ITEMS = [
  {
    question: 'What is SiMenu?',
    answer: 'SiMenu is a QR-code ordering system for restaurants. Each table gets a unique QR code that opens a live digital menu — customers order directly from their phone, and the order appears instantly on the restaurant\'s kitchen dashboard.',
  },
  {
    question: 'Do customers need to download an app?',
    answer: 'No. Customers scan the QR code with their phone\'s regular camera, and the menu opens directly in their web browser — no app download required.',
  },
  {
    question: 'Is there a free plan?',
    answer: 'Yes. The Free plan includes 1 restaurant, 3 tables, and core QR ordering, at no cost, with no time limit.',
  },
  {
    question: 'How much does SiMenu cost?',
    answer: 'Paid plans start at 1,499 PKR/month (Starter) and go up to 5,999 PKR/month (Premium), with every paid plan\'s first month completely free.',
  },
  {
    question: 'Can I use my own restaurant\'s branding?',
    answer: 'Yes. From the Growth plan upward, you can upload your own logo and choose your own brand colors, which apply automatically across your customer menu and dashboards.',
  },
  {
    question: 'Is my table QR code secure?',
    answer: 'Yes. Each table\'s QR code carries a unique security key checked on every order, and sessions automatically expire after a few hours — an old screenshot of a QR code stops working on its own.',
  },
];

// Structured data — see the competitive analysis doc (Part 4 & 5) for why
// this matters as much as it does: this is what lets Google, ChatGPT, and
// similar AI answer engines treat SiMenu as a real, citable "entity" rather
// than just crawled text.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'SiMenu',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'QR-code ordering and live kitchen dashboard platform for restaurants.',
      offers: PRICING_TIERS.map((tier) => ({
        '@type': 'Offer',
        name: `SiMenu ${tier.name}`,
        price: tier.price.replace(/,/g, ''),
        priceCurrency: 'PKR',
      })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ---- Nav ---- */}
      <nav className="border-b border-sand bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-display text-xl italic text-ink">SiMenu</span>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-semibold text-ink/60 hover:text-ink">Log in</a>
            <a href="/register" className="rounded-full bg-chili px-4 py-2 text-sm font-semibold text-paper shadow-sm shadow-chili/30">
              Get started free
            </a>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-16 sm:py-24 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-3xl italic leading-tight text-ink sm:text-4xl lg:text-5xl">
            Cut order mistakes to zero.<br />Get every table served faster.
          </h1>
          <p className="mt-5 max-w-md text-base text-ink/60">
            Give every table a QR code that opens a live, interactive menu. Orders land
            instantly on your kitchen dashboard — no app to install, no hardware to buy.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="/register" className="rounded-full bg-chili px-6 py-3 text-sm font-semibold text-paper shadow-md shadow-chili/30">
              Start free — no card needed
            </a>
            <a href="#pricing" className="text-sm font-semibold text-ink/60 hover:text-ink">See pricing →</a>
          </div>

          {/* Feature-icon callout row — same pattern used by mydigimenu.com's hero */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: '📱', label: 'QR Menu' },
              { icon: '🍳', label: 'Live Kitchen' },
              { icon: '📊', label: 'Analytics' },
              { icon: '🎨', label: 'Your Branding' },
            ].map((f) => (
              <div key={f.label} className="text-center">
                <div className="text-2xl">{f.icon}</div>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink/40">{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroQRDemo />
        </div>
      </section>

      {/* ---- Problem framing ---- */}
      <section className="border-y border-sand bg-white py-14">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-2xl italic text-ink">
            Your waiters are still writing orders by hand.
          </h2>
          <p className="mt-3 text-sm text-ink/60">
            Handwritten orders mean mistakes, slow tables, and a kitchen finding out what
            was ordered minutes late. SiMenu puts the order directly from the customer's
            phone onto your kitchen's screen — instantly, correctly, every time.
          </p>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center font-display text-2xl italic text-ink">Everything your restaurant actually needs</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-sand bg-white p-6">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Pricing ---- */}
      <section id="pricing" className="border-y border-sand bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center font-display text-2xl italic text-ink">Simple, honest pricing</h2>
          <p className="mt-2 text-center text-sm text-ink/50">Every paid plan's first month is completely free.</p>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-2xl border p-5 ${
                  tier.highlighted ? 'border-chili bg-chili/5 shadow-md shadow-chili/10' : 'border-sand bg-paper'
                }`}
              >
                <h3 className="font-display text-lg font-semibold text-ink">{tier.name}</h3>
                <p className="mt-2 font-mono text-2xl font-bold text-ink">
                  {tier.price} <span className="text-xs font-normal text-ink/40">PKR/mo</span>
                </p>
                <p className="mt-3 flex-1 text-xs text-ink/60">{tier.includes}</p>
                <a
                  href={tier.slug === 'premium' ? '/register?plan=premium' : `/register?plan=${tier.slug}`}
                  className={`mt-4 rounded-full px-4 py-2 text-center text-xs font-semibold ${
                    tier.highlighted ? 'bg-chili text-paper' : 'bg-white text-ink border border-sand'
                  }`}
                >
                  {tier.slug === 'premium' ? 'Contact us' : 'Get started'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-center font-display text-2xl italic text-ink">Frequently asked questions</h2>
        <div className="mt-8">
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="bg-basil py-16 text-center">
        <h2 className="font-display text-2xl italic text-paper">Ready to try it on your own restaurant?</h2>
        <a
          href="/register"
          className="mt-6 inline-block rounded-full bg-chili px-7 py-3 text-sm font-semibold text-paper shadow-md shadow-chili/30"
        >
          Start free — no card needed
        </a>
      </section>

      {/* ---- Footer ---- */}
      <footer className="bg-ink py-8 text-center text-xs text-paper/50">
        <p>© {new Date().getFullYear()} SiMenu. Built by <a href="https://sayyamijaz.netlify.app/" target="_blank" rel="noopener noreferrer nofollow" className="underline hover:text-paper">Sayyam Ijaz</a>.</p>
        <div className="mt-2 flex justify-center gap-4">
          <a href="/legal/privacy" className="hover:text-paper">Privacy Policy</a>
          <a href="/legal/terms" className="hover:text-paper">Terms of Service</a>
          <a href="/legal/refund" className="hover:text-paper">Refund Policy</a>
        </div>
      </footer>
    </div>
  );
}

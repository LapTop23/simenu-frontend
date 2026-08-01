// app/portal/page.jsx
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRequireAuth } from '../../hooks/useRequireAuth';

/**
 * The first thing an owner sees right after logging in — a choice between
 * the two very different jobs this system does: running the business
 * (menu, QR codes, sales) versus running the kitchen floor (live orders).
 * Previously, login went straight to /dashboard, and reaching /admin
 * required manually editing the URL — this page is the fix for that.
 */
export default function PortalRoute() {
  return (
    <Suspense fallback={<FullScreenState message="Loading…" />}>
      <Portal />
    </Suspense>
  );
}

function Portal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const restaurantSlug = searchParams.get('res');
  const { status: authStatus, logout } = useRequireAuth(restaurantSlug);

  if (!restaurantSlug) {
    return <FullScreenState message="No restaurant specified. Append ?res=your-restaurant-slug to the URL." isError />;
  }
  if (authStatus === 'checking') {
    return <FullScreenState message="Checking your login…" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex items-center justify-between px-6 py-5">
        <h1 className="font-display text-lg italic text-ink">SiMenu</h1>
        <button type="button" onClick={logout} className="rounded-full border border-sand px-3 py-1.5 text-xs font-semibold text-ink/60 hover:text-ink">
          Log out
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        <h2 className="mb-1 text-center font-display text-2xl italic text-ink">What would you like to open?</h2>
        <p className="mb-8 text-center text-sm text-ink/50">Pick a workspace — you can switch between them anytime.</p>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
          <WorkspaceCard
            imageSrc="/images/owner-dashboard.jpg"
            fallbackIcon="📊"
            fallbackTint="bg-basil"
            title="Owner Dashboard"
            description="Manage your menu, print table QR codes, and check your sales."
            onClick={() => router.push(`/dashboard?res=${restaurantSlug}`)}
          />
          <WorkspaceCard
            imageSrc="/images/kitchen-dashboard.jpg"
            fallbackIcon="🍳"
            fallbackTint="bg-chili"
            title="Kitchen Dashboard"
            description="See incoming orders live and mark them as they're prepared."
            onClick={() => router.push(`/admin?res=${restaurantSlug}`)}
          />
        </div>
      </main>
    </div>
  );
}

function WorkspaceCard({ imageSrc, fallbackIcon, fallbackTint, title, description, onClick }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-3xl border border-sand bg-white text-left shadow-sm shadow-ink/5 transition-transform hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-40 w-full overflow-hidden sm:h-48">
        {!imageFailed ? (
          <img
            src={imageSrc}
            alt={title}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${fallbackTint}`}>
            <span className="text-5xl">{fallbackIcon}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink/60">{description}</p>
        <span className="mt-3 inline-block text-sm font-semibold text-basil group-hover:underline">Open →</span>
      </div>
    </button>
  );
}

function FullScreenState({ message, isError = false }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className={isError ? 'text-sm text-chili' : 'text-sm text-ink/60'}>{message}</p>
    </div>
  );
}

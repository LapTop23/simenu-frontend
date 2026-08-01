// app/dashboard/page.jsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminMenu } from '../../hooks/useAdminMenu';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { resendVerificationEmail } from '../../lib/api';
import MenuManagementPanel from '../../components/admin/MenuManagementPanel';
import QRCodeGeneratorPanel from '../../components/admin/QRCodeGeneratorPanel';
import AnalyticsPanel from '../../components/admin/AnalyticsPanel';
import SettingsPanel from '../../components/admin/SettingsPanel';
import WorkspaceMenu from '../../components/admin/WorkspaceMenu';
import ThemeColorInjector from '../../components/ThemeColorInjector';

const TABS = [
  { id: 'menu', label: 'Menu Management' },
  { id: 'analytics', label: 'Sales Analytics' },
];

/**
 * `useSearchParams` requires a Suspense boundary in the App Router — same
 * pattern as app/menu/page.jsx and app/admin/page.jsx.
 *
 * Access to this route requires a valid login for THIS SPECIFIC restaurant —
 * see hooks/useRequireAuth.js. Every write action taken from here (menu CRUD,
 * image uploads) is ALSO independently re-checked by the backend itself, so
 * this page-level guard is a UX convenience (redirecting before rendering
 * anything sensitive), not the actual security boundary.
 */
export default function DashboardRoute() {
  return (
    <Suspense fallback={<FullScreenState message="Loading dashboard…" />}>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const searchParams = useSearchParams();
  const restaurantSlug = searchParams.get('res');
  const [activeTab, setActiveTab] = useState('menu');
  const { status: authStatus, ownerEmail, isEmailVerified, logout } = useRequireAuth(restaurantSlug);
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent'

  // Fetching restaurant name here (rather than duplicating a separate fetch
  // inside QRCodeGeneratorPanel) keeps a single source of truth for tenant
  // identity across both tabs — useAdminMenu already loads it as a side
  // effect of loading the menu.
  const { restaurant, status } = useAdminMenu(restaurantSlug);

  // Holds the most recent branding/plan values saved from the Settings tab —
  // merged over whatever useAdminMenu originally loaded, so a logo/color
  // change (or a plan change) reflects everywhere on this page INSTANTLY,
  // without needing a full reload.
  const [brandingOverride, setBrandingOverride] = useState(null);
  const effectiveRestaurant = brandingOverride ? { ...restaurant, ...brandingOverride } : restaurant;

  useEffect(() => {
    document.title = 'Owner Dashboard — SiMenu';
  }, []);

  const handleResendVerification = async () => {
    setResendStatus('sending');
    try {
      await resendVerificationEmail();
      setResendStatus('sent');
    } catch {
      setResendStatus('idle');
    }
  };

  if (!restaurantSlug) {
    return <FullScreenState message="No restaurant specified. Append ?res=your-restaurant-slug to the URL." isError />;
  }

  if (authStatus === 'checking') {
    return <FullScreenState message="Checking your login…" />;
  }

  return (
    <div className="min-h-screen bg-paper">
      <ThemeColorInjector branding={effectiveRestaurant?.branding} />

      <header className="no-print sticky top-0 z-20 border-b border-sand bg-white">
        <div className="mx-auto max-w-5xl px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-xl italic text-ink">
              {status === 'ready' ? restaurant?.name : 'SiMenu'} — Owner Dashboard
            </h1>
            <div className="flex items-center gap-3">
              {ownerEmail && <span className="hidden text-xs text-ink/40 sm:inline">{ownerEmail}</span>}
              <WorkspaceMenu
                restaurantSlug={restaurantSlug}
                onLogout={logout}
                variant="light"
                extraItems={[
                  { label: 'Table QR Codes', onClick: () => setActiveTab('qr') },
                  { label: 'Settings', onClick: () => setActiveTab('settings') },
                ]}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  activeTab === tab.id ? 'border-basil bg-basil text-paper' : 'border-sand bg-white text-ink/60 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {!isEmailVerified && (
        <div className="border-b border-saffron/30 bg-saffron/10 px-5 py-2.5 text-center text-xs font-medium text-saffron-dark">
          Please verify your email address.{' '}
          {resendStatus === 'sent' ? (
            <span>Verification email sent — check your inbox.</span>
          ) : (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendStatus === 'sending'}
              className="font-semibold underline hover:no-underline disabled:opacity-50"
            >
              {resendStatus === 'sending' ? 'Sending…' : 'Resend verification email'}
            </button>
          )}
        </div>
      )}

      <main className="mx-auto max-w-5xl px-5 py-6">
        {activeTab === 'menu' && <MenuManagementPanel restaurantSlug={restaurantSlug} />}
        {activeTab === 'qr' && (
          <QRCodeGeneratorPanel restaurantSlug={restaurantSlug} restaurantName={restaurant?.name || restaurantSlug} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsPanel restaurantSlug={restaurantSlug} currency={restaurant?.currency || 'PKR'} />
        )}
        {activeTab === 'settings' && (
          <SettingsPanel
            restaurantSlug={restaurantSlug}
            restaurant={effectiveRestaurant}
            onBrandingUpdated={setBrandingOverride}
          />
        )}
      </main>
    </div>
  );
}

function FullScreenState({ message, isError = false }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className={isError ? 'text-sm text-chili' : 'text-sm text-ink/60'}>{message}</p>
    </div>
  );
}

// app/admin/page.jsx
'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import OrderCard from '../../components/admin/OrderCard';
import WorkspaceMenu from '../../components/admin/WorkspaceMenu';
import ThemeColorInjector from '../../components/ThemeColorInjector';

const FILTER_TABS = ['All', 'Pending', 'Preparing', 'Ready', 'Completed'];

/**
 * `useSearchParams` requires a Suspense boundary in the App Router — see the
 * same pattern in app/menu/page.jsx.
 *
 * Access requires a valid login for THIS SPECIFIC restaurant (see
 * hooks/useRequireAuth.js). This is a real gate, not just a UI convenience:
 * the underlying REST endpoint (GET /api/orders) and the 'join-admin-room'
 * socket event are BOTH independently protected on the backend, so even a
 * request that skipped this page entirely would still be refused.
 */
export default function AdminDashboardRoute() {
  return (
    <Suspense fallback={<FullScreenState message="Connecting to live orders…" />}>
      <AdminDashboard />
    </Suspense>
  );
}

function AdminDashboard() {
  const searchParams = useSearchParams();
  const restaurantSlug = searchParams.get('res');
  const { status: authStatus, ownerEmail, logout } = useRequireAuth(restaurantSlug);
  const { orders, status, error, restaurant, updateStatus, newOrderId } = useAdminOrders(
    authStatus === 'authorized' ? restaurantSlug : null
  );
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredOrders = useMemo(() => {
    const list = activeFilter === 'All' ? orders : orders.filter((o) => o.orderStatus === activeFilter);
    // Oldest-first: a kitchen display is a queue, not a feed — the order
    // staff should tackle next belongs at the top, not buried by newer ones.
    return [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [orders, activeFilter]);

  const counts = useMemo(() => {
    const base = { Pending: 0, Preparing: 0, Ready: 0, Completed: 0 };
    orders.forEach((o) => {
      if (base[o.orderStatus] !== undefined) base[o.orderStatus] += 1;
    });
    return base;
  }, [orders]);

  if (authStatus === 'checking') return <FullScreenState message="Checking your login…" />;
  if (status === 'loading') return <FullScreenState message="Connecting to live orders…" />;
  if (status === 'error') return <FullScreenState message={error} isError />;

  return (
    <div className="min-h-screen bg-paper">
      <ThemeColorInjector branding={restaurant?.branding} />

      {/* ---- Header: dark "control room" surface, distinct from the customer app but sharing its brand DNA ---- */}
      <header className="sticky top-0 z-20 bg-ink text-paper shadow-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h1 className="font-display text-xl italic text-paper">{restaurant?.name || 'SiMenu'} — Live Orders</h1>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saffron" />
              <span className="text-[11px] uppercase tracking-wider text-paper/50">Connected · live</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-3 font-mono text-xs">
              {Object.entries(counts).map(([label, count]) => (
                <div key={label} className="rounded-lg bg-white/5 px-3 py-1.5 text-center">
                  <p className="text-sm font-bold text-saffron">{count}</p>
                  <p className="text-[10px] uppercase tracking-wide text-paper/40">{label}</p>
                </div>
              ))}
            </div>
            <WorkspaceMenu restaurantSlug={restaurantSlug} onLogout={logout} variant="dark" />
          </div>
        </div>

        {/* ---- Filter tabs ---- */}
        <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 pb-3">
          {FILTER_TABS.map((tab) => {
            const isActive = tab === activeFilter;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`flex-shrink-0 rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'border-saffron bg-saffron text-ink'
                    : 'border-white/15 bg-transparent text-paper/60 hover:text-paper'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </header>

      {/* ---- Order grid ---- */}
      <main className="mx-auto max-w-6xl px-5 py-6">
        {filteredOrders.length === 0 ? (
          <p className="py-24 text-center text-sm text-ink/40">No orders in this view yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                currency={restaurant?.currency || 'PKR'}
                onStatusChange={updateStatus}
                isNew={order._id === newOrderId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FullScreenState({ message, isError = false }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <p className={isError ? 'text-sm text-chili' : 'text-sm text-paper/60'}>{message}</p>
    </div>
  );
}

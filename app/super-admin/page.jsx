// app/super-admin/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRequireSuperAdmin } from '../../hooks/useRequireSuperAdmin';
import { fetchSuperAdminStats, fetchSuperAdminReviews } from '../../lib/api';

export default function SuperAdminDashboard() {
  const { status: authStatus, logout } = useRequireSuperAdmin();
  const [activeTab, setActiveTab] = useState('restaurants');

  useEffect(() => {
    document.title = 'Super Admin — SiMenu';
  }, []);

  if (authStatus === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <p className="text-sm text-white/50">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="font-display text-lg italic">SiMenu — Super Admin</h1>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white"
          >
            Log out
          </button>
        </div>
        <div className="mx-auto mt-3 flex max-w-6xl gap-2">
          {[
            { id: 'restaurants', label: 'Restaurants' },
            { id: 'reviews', label: 'SiMenu Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                activeTab === tab.id ? 'border-white bg-white text-ink' : 'border-white/15 text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {activeTab === 'restaurants' && <RestaurantsPanel />}
        {activeTab === 'reviews' && <ReviewsPanel />}
      </main>
    </div>
  );
}

function RestaurantsPanel() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuperAdminStats()
      .then((result) => {
        setData(result);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message || 'Could not load restaurant stats.');
        setStatus('error');
      });
  }, []);

  if (status === 'loading') return <p className="py-16 text-center text-sm text-white/40">Loading…</p>;
  if (status === 'error') return <p className="py-16 text-center text-sm text-chili">{error}</p>;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Restaurants" value={data.totalRestaurants} />
        <StatCard label="Active" value={data.activeCount} accent="text-basil" />
        <StatCard label="Inactive" value={data.inactiveCount} accent="text-chili" />
        <StatCard label="Plans" value={Object.entries(data.planCounts).map(([p, c]) => `${p}: ${c}`).join(', ')} small />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-4 py-3 font-semibold">Restaurant</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Subscription</th>
              <th className="px-4 py-3 font-semibold">Registered</th>
            </tr>
          </thead>
          <tbody>
            {data.restaurants.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-white/50">{r.slug}</td>
                <td className="px-4 py-3 capitalize">{r.plan}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.isActive ? 'bg-basil/20 text-basil' : 'bg-chili/20 text-chili'}`}>
                    {r.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize text-white/60">{r.subscriptionStatus}</td>
                <td className="px-4 py-3 text-white/50">{new Date(r.registeredAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {data.restaurants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                  No restaurants registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewsPanel() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuperAdminReviews()
      .then((result) => {
        setData(result);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message || 'Could not load reviews.');
        setStatus('error');
      });
  }, []);

  if (status === 'loading') return <p className="py-16 text-center text-sm text-white/40">Loading…</p>;
  if (status === 'error') return <p className="py-16 text-center text-sm text-chili">{error}</p>;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total Reviews" value={data.totalCount} />
        <StatCard label="Average Rating" value={`${data.averageRating} ★`} accent="text-saffron" />
      </div>

      <div className="mt-6 space-y-3">
        {data.reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{r.restaurantName}</p>
                <p className="text-xs text-white/40">
                  {r.tableNumber ? `Table ${r.tableNumber} · ` : ''}
                  {new Date(r.submittedAt).toLocaleString()}
                </p>
              </div>
              <span className="flex-shrink-0 font-mono text-sm text-saffron">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            {r.comment && <p className="mt-2 text-sm text-white/70">{r.comment}</p>}
          </div>
        ))}
        {data.reviews.length === 0 && <p className="py-16 text-center text-sm text-white/40">No reviews submitted yet.</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = 'text-white', small = false }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p>
      <p className={`mt-1 font-mono font-bold ${accent} ${small ? 'text-xs' : 'text-2xl'}`}>{value}</p>
    </div>
  );
}

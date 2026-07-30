// components/admin/AnalyticsPanel.jsx
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchSalesAnalytics } from '../../lib/api';

const RANGE_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export default function AnalyticsPanel({ restaurantSlug, currency }) {
  const [rangeDays, setRangeDays] = useState(7);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!restaurantSlug) return;
    setStatus('loading');
    setError(null);

    fetchSalesAnalytics(restaurantSlug, rangeDays)
      .then((result) => {
        setData(result);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message || 'Could not load sales analytics.');
        setStatus('error');
      });
  }, [restaurantSlug, rangeDays]);

  if (status === 'loading') return <p className="py-16 text-center text-sm text-ink/40">Loading sales data…</p>;
  if (status === 'error') return <p className="py-16 text-center text-sm text-chili">{error}</p>;
  if (!data) return null;

  // Chart wants every day in the range represented, even ones with zero
  // orders — otherwise a quiet day just silently vanishes from the x-axis
  // instead of showing as a visible gap, which misrepresents the trend.
  const chartData = buildFullDateRange(rangeDays).map((date) => {
    const match = data.dailyRevenue.find((d) => d.date === date);
    return { date: formatShortDate(date), revenue: match?.revenue || 0 };
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg italic text-ink">Sales overview</h2>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.days}
              type="button"
              onClick={() => setRangeDays(option.days)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                rangeDays === option.days ? 'border-basil bg-basil text-paper' : 'border-sand bg-white text-ink/60'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Summary cards ---- */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Total revenue" value={`${currency} ${data.totalRevenue.toFixed(2)}`} />
        <SummaryCard label="Orders" value={data.totalOrders} />
        <SummaryCard label="Average order value" value={`${currency} ${data.averageOrderValue.toFixed(2)}`} />
      </div>

      {/* ---- Revenue chart ---- */}
      <div className="mt-6 rounded-2xl border border-sand bg-white p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">Revenue by day</h3>
        {data.totalOrders === 0 ? (
          <p className="py-10 text-center text-sm text-ink/40">No orders yet in this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D8" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#1B1F1C99' }} />
              <YAxis tick={{ fontSize: 11, fill: '#1B1F1C99' }} />
              <Tooltip formatter={(value) => [`${currency} ${Number(value).toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#D62828" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ---- Top-selling items ---- */}
      <div className="mt-6 rounded-2xl border border-sand bg-white p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/40">Best-selling items</h3>
        {data.topItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink/40">No items sold yet in this period.</p>
        ) : (
          <div className="space-y-2">
            {data.topItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between border-b border-sand pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-paper text-[10px] font-bold text-ink/50">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-ink">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-ink">{item.quantitySold} sold</p>
                  <p className="text-xs text-ink/40">{currency} {item.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-sand bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

// Builds an array of 'YYYY-MM-DD' strings for the last `days` days, ending
// today — used so the chart shows a continuous timeline instead of only the
// dates that happened to have orders.
function buildFullDateRange(days) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function formatShortDate(isoDate) {
  const [, month, day] = isoDate.split('-');
  return `${month}/${day}`;
}

// components/admin/OrderCard.jsx
'use client';

import { useEffect, useState } from 'react';
import StatusPill from './StatusPill';

const STATUS_FLOW = ['Pending', 'Preparing', 'Ready', 'Completed'];

/**
 * OrderCard — a single order rendered as a torn-ticket stub, echoing the same
 * scalloped `.ticket-edge` motif used on the customer app's floating cart bar.
 * Reusing that signature here (rather than inventing a second one for admin)
 * keeps the two surfaces feeling like one product instead of two.
 */
export default function OrderCard({ order, currency, onStatusChange, isNew }) {
  const [timeAgoLabel, setTimeAgoLabel] = useState(() => formatTimeAgo(order.createdAt));

  // Re-derive the "x minutes ago" label on an interval rather than once at
  // mount — kitchen displays are typically left open for an entire shift, and
  // a static "2 minutes ago" that never advances would quickly mislead staff.
  useEffect(() => {
    const interval = setInterval(() => setTimeAgoLabel(formatTimeAgo(order.createdAt)), 30_000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const currentIndex = STATUS_FLOW.indexOf(order.orderStatus);
  const nextStatus = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;
  const isTerminal = order.orderStatus === 'Completed' || order.orderStatus === 'Cancelled';

  return (
    <article
      className={`ticket-edge overflow-hidden rounded-b-2xl border border-sand bg-white pt-4 shadow-sm shadow-ink/5 ${
        isNew ? 'animate-pop-in ring-2 ring-saffron' : ''
      }`}
    >
      <div className="px-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-ink/40">
              #{order.orderNumber}
            </p>
            <h3 className="mt-0.5 font-display text-lg font-semibold leading-tight text-ink">
              Table {order.tableNumber}
            </h3>
          </div>
          <div className="text-right">
            <StatusPill status={order.orderStatus} />
            <p className="mt-1 text-[11px] text-ink/40">{timeAgoLabel}</p>
          </div>
        </div>

        <ul className="mt-3 space-y-1.5 border-t border-dashed border-sand pt-3">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink/80">
                <span className="font-mono text-xs text-ink/40">{item.quantity}×</span> {item.name}
                {item.selectedModifiers?.length > 0 && (
                  <span className="block text-[11px] text-ink/40">
                    {item.selectedModifiers.map((m) => m.optionName).join(', ')}
                  </span>
                )}
              </span>
              <span className="flex-shrink-0 font-mono text-xs text-ink/50">
                {currency} {item.lineTotal.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between border-t border-sand pt-3">
          <span className="text-xs font-medium text-ink/50">
            {order.paymentMethod === 'Digital_Wallet' ? 'Digital Wallet' : 'Cash'}
          </span>
          <span className="font-mono text-base font-bold text-ink">
            {currency} {order.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mx-4 mt-3 border-t border-dashed border-sand" />

      <div className="flex items-center gap-2 px-4 py-3">
        <select
          value={order.orderStatus}
          onChange={(e) => onStatusChange(order._id, e.target.value)}
          disabled={isTerminal}
          className="flex-1 rounded-lg border border-sand bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {[...STATUS_FLOW, 'Cancelled'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {nextStatus && (
          <button
            type="button"
            onClick={() => onStatusChange(order._id, nextStatus)}
            className="flex-shrink-0 rounded-lg bg-basil px-3 py-1.5 text-xs font-semibold text-paper transition-transform active:scale-95"
          >
            Mark {nextStatus} →
          </button>
        )}
      </div>
    </article>
  );
}

function formatTimeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ago`;
}

// components/admin/StatusPill.jsx
'use client';

const STATUS_STYLES = {
  Pending: 'bg-sand text-ink/70 border-ink/10',
  Preparing: 'bg-saffron/20 text-saffron-dark border-saffron/40',
  Ready: 'bg-basil/15 text-basil border-basil/30',
  Completed: 'bg-ink/5 text-ink/40 border-ink/10',
  Cancelled: 'bg-chili/10 text-chili border-chili/30',
};

export default function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${style}`}
    >
      {status}
    </span>
  );
}

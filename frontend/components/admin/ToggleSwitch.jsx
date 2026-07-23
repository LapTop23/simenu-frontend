// components/admin/ToggleSwitch.jsx
'use client';

/**
 * ToggleSwitch — a controlled, accessible on/off switch. Used by
 * MenuManagementPanel for the "available on customer menu" flip: clicking it
 * fires `onChange` immediately (no separate "Save" step), matching the "real-time
 * ... instantly updates" requirement for item availability.
 */
export default function ToggleSwitch({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-basil' : 'bg-sand'
      }`}
    >
      <span
        className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
        style={{ height: '18px', width: '18px' }}
      />
    </button>
  );
}

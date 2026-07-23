// components/ModifierSheet.jsx
'use client';

import { useMemo, useState } from 'react';

/**
 * ModifierSheet — a bottom sheet that opens when an item has one or more
 * modifier groups (e.g. "Spice Level" single-select, "Add-ons" multi-select).
 * Enforces required groups before allowing "Add to cart", and reflects the
 * live price impact of each selection in real time.
 */
export default function ModifierSheet({ item, onConfirm, onClose }) {
  const [quantity, setQuantity] = useState(1);
  // selections: { [groupName]: string[] } — always an array, even for single-select groups.
  const [selections, setSelections] = useState({});

  const toggleOption = (group, optionName) => {
    setSelections((prev) => {
      const current = prev[group.name] || [];

      if (group.selectionType === 'single') {
        return { ...prev, [group.name]: [optionName] };
      }

      const alreadySelected = current.includes(optionName);
      return {
        ...prev,
        [group.name]: alreadySelected ? current.filter((o) => o !== optionName) : [...current, optionName],
      };
    });
  };

  const missingRequiredGroup = useMemo(() => {
    return item.modifiers.find((group) => group.isRequired && !(selections[group.name]?.length > 0));
  }, [item.modifiers, selections]);

  const flatModifiers = useMemo(() => {
    const flat = [];
    item.modifiers.forEach((group) => {
      (selections[group.name] || []).forEach((optionName) => {
        const option = group.options.find((o) => o.name === optionName);
        if (option) flat.push({ groupName: group.name, optionName, priceDelta: option.priceDelta });
      });
    });
    return flat;
  }, [item.modifiers, selections]);

  const unitPrice = item.price + flatModifiers.reduce((sum, m) => sum + m.priceDelta, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40" role="dialog" aria-modal="true">
      <div className="animate-slide-up flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-white">
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <span className="h-1 w-10 rounded-full bg-sand" />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 pt-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">{item.name}</h2>
            <p className="mt-0.5 text-xs text-ink/60">{item.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-paper text-ink/50 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-2 flex-1 overflow-y-auto px-5 pb-4">
          {item.modifiers.map((group) => (
            <div key={group.name} className="mt-5 first:mt-3">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-ink">{group.name}</h3>
                <span className="text-[11px] uppercase tracking-wide text-ink/40">
                  {group.isRequired ? 'Required' : 'Optional'} · {group.selectionType === 'single' ? 'Pick 1' : 'Pick any'}
                </span>
              </div>

              <div className="mt-2 space-y-2">
                {group.options.map((option) => {
                  const isSelected = (selections[group.name] || []).includes(option.name);
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => toggleOption(group, option.name)}
                      className={[
                        'flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
                        isSelected ? 'border-saffron bg-saffron/10' : 'border-sand bg-white',
                      ].join(' ')}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={[
                            'flex h-4 w-4 items-center justify-center rounded-full border',
                            isSelected ? 'border-saffron-dark bg-saffron-dark' : 'border-ink/20',
                          ].join(' ')}
                        >
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        {option.name}
                      </span>
                      {option.priceDelta !== 0 && (
                        <span className="font-mono text-xs text-ink/60">
                          {option.priceDelta > 0 ? '+' : ''}
                          {option.priceDelta.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-sand px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-ink/70">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-5 text-center font-mono text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={Boolean(missingRequiredGroup)}
            onClick={() => onConfirm(flatModifiers, quantity)}
            className="flex w-full items-center justify-between rounded-2xl bg-chili px-5 py-3.5 text-paper shadow-md shadow-chili/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="font-semibold">
              {missingRequiredGroup ? `Select ${missingRequiredGroup.name}` : 'Add to cart'}
            </span>
            <span className="font-mono font-semibold">{(unitPrice * quantity).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

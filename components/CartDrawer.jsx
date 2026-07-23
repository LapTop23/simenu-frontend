// components/CartDrawer.jsx
'use client';

import { useCart } from '../context/CartContext';

/**
 * CartDrawer — full review of every line item, opened by tapping the
 * FloatingCartBar. Line items remain individually editable (quantity ±,
 * remove) right up until checkout, since a table-side order is usually
 * adjusted a few times before it's actually sent to the kitchen.
 */
export default function CartDrawer({ currency = 'PKR', tableNumber, onClose, onCheckout, isSubmitting, submitError }) {
  const { lines, totalAmount, updateQuantity, removeLine } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40" role="dialog" aria-modal="true">
      <div className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-3xl bg-white">
        <div className="flex justify-center pt-3">
          <span className="h-1 w-10 rounded-full bg-sand" />
        </div>

        <div className="flex items-center justify-between px-5 pt-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Your order</h2>
            {tableNumber && <p className="text-xs text-ink/50">Table {tableNumber}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink/50 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto px-5 pb-4">
          {lines.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink/50">Your cart is empty.</p>
          ) : (
            <ul className="space-y-3">
              {lines.map((line) => (
                <li key={line.cartLineId} className="flex gap-3 rounded-xl border border-sand p-3">
                  {line.image && (
                    <img src={line.image} alt={line.name} className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-ink">{line.name}</p>
                      <button
                        type="button"
                        onClick={() => removeLine(line.cartLineId)}
                        className="text-xs text-ink/40 hover:text-chili"
                      >
                        Remove
                      </button>
                    </div>
                    {line.modifiers.length > 0 && (
                      <p className="mt-0.5 truncate text-[11px] text-ink/50">
                        {line.modifiers.map((m) => m.optionName).join(', ')}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.cartLineId, line.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-paper text-xs text-ink"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-4 text-center font-mono text-xs">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.cartLineId, line.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-paper text-xs text-ink"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-mono text-sm font-semibold text-ink">
                        {currency} {(line.unitPrice * line.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-sand px-5 py-4">
          {submitError && (
            <p className="mb-3 rounded-lg bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{submitError}</p>
          )}
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-ink/60">Total</span>
            <span className="font-mono text-lg font-semibold text-ink">
              {currency} {totalAmount.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            disabled={lines.length === 0 || isSubmitting}
            onClick={onCheckout}
            className="w-full rounded-2xl bg-chili py-3.5 text-center font-semibold text-paper shadow-md shadow-chili/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// components/FloatingCartBar.jsx
'use client';

import { useCart } from '../context/CartContext';

/**
 * FloatingCartBar — the page's signature element. Shaped like a torn kitchen
 * order ticket (scalloped top edge via the `.ticket-edge` utility), it slides
 * up from the bottom the instant the first item lands in the cart, and stays
 * pinned there — a persistent, low-friction path to checkout that never
 * requires scrolling back up.
 */
export default function FloatingCartBar({ currency = 'PKR', onViewCart }) {
  const { totalItems, totalAmount } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      <button
        type="button"
        onClick={onViewCart}
        className="ticket-edge animate-slide-up w-full max-w-lg rounded-b-2xl bg-basil pb-4 pt-5 text-left shadow-2xl shadow-ink/30"
      >
        <div className="flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 animate-pop-in items-center justify-center rounded-full bg-saffron font-mono text-sm font-bold text-ink">
              {totalItems}
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-medium uppercase tracking-wider text-paper/60">View cart</p>
              <p className="font-display text-sm italic text-paper">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} added
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-semibold text-saffron">
              {currency} {totalAmount.toFixed(2)}
            </span>
            <span className="text-paper/70">→</span>
          </div>
        </div>

        {/* Dashed perforation line — reinforces the "tear here" ticket motif. */}
        <div className="mx-5 mt-3 border-t border-dashed border-paper/20" />
      </button>
    </div>
  );
}

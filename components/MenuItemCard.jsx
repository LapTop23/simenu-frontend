// components/MenuItemCard.jsx
'use client';

/**
 * A single dish card. If the item has modifier groups, "+ Add" opens the
 * ModifierSheet (handled by the parent) instead of adding directly — a card
 * never silently guesses a customer's preference for a customizable dish.
 *
 * `isAvailable === false` renders a "Sold Out" state (dimmed image, disabled
 * button) rather than disappearing entirely — an owner flipping the
 * dashboard's availability toggle pushes this over the live 'menu-item-updated'
 * socket event (see hooks/useTenantMenu.js), so this state can change under a
 * customer's thumb without any page refresh.
 */
export default function MenuItemCard({ item, onAddDirect, onRequireModifiers }) {
  const hasModifiers = Array.isArray(item.modifiers) && item.modifiers.length > 0;
  const isSoldOut = item.isAvailable === false;

  const handleAddClick = () => {
    if (isSoldOut) return;
    if (hasModifiers) {
      onRequireModifiers(item);
    } else {
      onAddDirect(item, []);
    }
  };

  return (
    <article className="flex gap-3 rounded-2xl border border-sand bg-white p-3 shadow-sm shadow-ink/5">
      <div className="relative h-24 w-24 flex-shrink-0">
        <img
          src={item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'}
          alt={item.name}
          className={`h-24 w-24 rounded-xl object-cover ${isSoldOut ? 'grayscale' : ''}`}
          loading="lazy"
        />
        {isSoldOut && (
          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-ink/50">
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
              Sold out
            </span>
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-display text-base font-semibold leading-tight ${isSoldOut ? 'text-ink/40' : 'text-ink'}`}>
              {item.name}
            </h3>
            {item.isFeatured && !isSoldOut && (
              <span className="flex-shrink-0 rounded-full bg-chili/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-chili">
                Chef's pick
              </span>
            )}
          </div>
          <p className={`mt-1 line-clamp-2 text-xs leading-snug ${isSoldOut ? 'text-ink/30' : 'text-ink/60'}`}>
            {item.description}
          </p>

          {!isSoldOut && Array.isArray(item.dietaryTags) && item.dietaryTags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {item.dietaryTags.map((tag) => (
                <span key={tag} className="rounded-full bg-basil/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-basil">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {!isSoldOut && Array.isArray(item.allergens) && item.allergens.length > 0 && (
            <p className="mt-1 text-[10px] text-ink/40">
              Contains: {item.allergens.join(', ')}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className={`font-mono text-sm font-semibold ${isSoldOut ? 'text-ink/30' : 'text-ink'}`}>
            {formatPrice(item.price, item.currency)}
          </span>

          <button
            type="button"
            onClick={handleAddClick}
            disabled={isSoldOut}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-transform duration-150 active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100 ${
              isSoldOut ? 'bg-sand text-ink/40 shadow-none' : 'bg-chili text-paper shadow-chili/30'
            }`}
          >
            {!isSoldOut && <span className="text-sm leading-none">+</span>}
            {isSoldOut ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
}

function formatPrice(price, currency = 'PKR') {
  const numeric = Number(price ?? 0);
  return `${currency} ${numeric.toFixed(2)}`;
}

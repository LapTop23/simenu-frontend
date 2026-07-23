// components/CategoryBar.jsx
'use client';

/**
 * Horizontal, snap-scrolling category rail. Chips encode state through fill
 * (active = solid saffron) rather than an extra icon or badge — the filter
 * IS the label, nothing decorates it further.
 */
export default function CategoryBar({ categories, activeCategory, onSelect }) {
  const allCategories = ['All', ...categories];

  return (
    <div className="sticky top-[64px] z-20 border-b border-sand bg-paper/95 backdrop-blur">
      <div className="no-scrollbar mx-auto flex max-w-lg gap-2 overflow-x-auto px-4 py-3">
        {allCategories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={[
                'flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'border-saffron bg-saffron text-ink shadow-sm shadow-saffron/40'
                  : 'border-sand bg-white text-ink/60 hover:border-saffron/60 hover:text-ink',
              ].join(' ')}
              aria-pressed={isActive}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}

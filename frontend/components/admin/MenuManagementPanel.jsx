// components/admin/MenuManagementPanel.jsx
'use client';

import { useMemo, useState } from 'react';
import { useAdminMenu } from '../../hooks/useAdminMenu';
import MenuItemForm from './MenuItemForm';
import ToggleSwitch from './ToggleSwitch';

export default function MenuManagementPanel({ restaurantSlug }) {
  const { items, restaurant, status, error, addItem, editItem, toggleAvailability, removeItem } = useAdminMenu(restaurantSlug);
  const [formTarget, setFormTarget] = useState(undefined); // undefined = closed, null = "add new", object = "edit this item"
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [rowError, setRowError] = useState(null);

  const currency = restaurant?.currency || 'PKR';

  const groupedByCategory = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    Object.values(groups).forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));
    return groups;
  }, [items]);

  const handleFormSubmit = async (payload) => {
    if (formTarget && formTarget._id) {
      await editItem(formTarget._id, payload);
    } else {
      await addItem(payload);
    }
    setFormTarget(undefined);
  };

  const handleToggle = async (itemId, next) => {
    setRowError(null);
    try {
      await toggleAvailability(itemId, next);
    } catch (err) {
      setRowError(err.message || 'Could not update availability.');
    }
  };

  const handleDelete = async (itemId) => {
    setRowError(null);
    try {
      await removeItem(itemId);
    } catch (err) {
      setRowError(err.message || 'Could not delete this item.');
    } finally {
      setPendingDeleteId(null);
    }
  };

  if (status === 'loading') return <p className="py-16 text-center text-sm text-ink/40">Loading menu…</p>;
  if (status === 'error') return <p className="py-16 text-center text-sm text-chili">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg italic text-ink">Menu items ({items.length})</h2>
        <button
          type="button"
          onClick={() => setFormTarget(null)}
          className="rounded-full bg-chili px-4 py-2 text-sm font-semibold text-paper shadow-sm shadow-chili/30"
        >
          + Add item
        </button>
      </div>

      {rowError && <p className="mt-3 rounded-lg bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{rowError}</p>}

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink/40">No menu items yet — add your first one above.</p>
      ) : (
        <div className="mt-4 space-y-6">
          {Object.entries(groupedByCategory).map(([category, categoryItems]) => (
            <div key={category}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">{category}</h3>
              <div className="overflow-hidden rounded-2xl border border-sand bg-white">
                {categoryItems.map((item, index) => (
                  <div
                    key={item._id}
                    className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? 'border-t border-sand' : ''}`}
                  >
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'}
                      alt=""
                      className={`h-12 w-12 flex-shrink-0 rounded-lg object-cover ${!item.isAvailable ? 'grayscale' : ''}`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                      <p className="font-mono text-xs text-ink/50">{currency} {item.price.toFixed(2)}</p>
                    </div>

                    <ToggleSwitch
                      checked={item.isAvailable}
                      onChange={(next) => handleToggle(item._id, next)}
                      label={`Toggle availability for ${item.name}`}
                    />

                    <button type="button" onClick={() => setFormTarget(item)} className="rounded-lg bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-sand">
                      Edit
                    </button>

                    {pendingDeleteId === item._id ? (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleDelete(item._id)} className="rounded-lg bg-chili px-2.5 py-1.5 text-xs font-semibold text-paper">
                          Confirm
                        </button>
                        <button type="button" onClick={() => setPendingDeleteId(null)} className="rounded-lg bg-paper px-2 py-1.5 text-xs text-ink/50">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setPendingDeleteId(item._id)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-chili hover:bg-chili/10">
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {formTarget !== undefined && (
        <MenuItemForm item={formTarget} restaurantSlug={restaurantSlug} onSubmit={handleFormSubmit} onClose={() => setFormTarget(undefined)} />
      )}
    </div>
  );
}

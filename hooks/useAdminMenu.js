// hooks/useAdminMenu.js
'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchTenantMenu, createMenuItem, updateMenuItem, updateItemAvailability, deleteMenuItem } from '../lib/api';
import { getSocket } from '../lib/socket';

/**
 * useAdminMenu — the data layer behind the Menu Management dashboard.
 *
 * Loads the FULL catalog (including sold-out items — `includeUnavailable:
 * true`, since an owner managing the menu needs to see everything, not just
 * what customers currently see) and keeps a flat array in state rather than
 * the category-grouped shape the customer app uses; a management table wants
 * one flat, sortable/filterable list.
 *
 * Also joins the same 'menu' room the customer app listens on
 * (`join-menu-room`), so if this restaurant's menu is open on two admin
 * devices at once, an edit made on one appears on the other instantly too —
 * exactly the same mechanism that pushes availability changes to customers.
 */
export function useAdminMenu(restaurantSlug) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  const load = useCallback(async () => {
    if (!restaurantSlug) {
      setStatus('error');
      setError('No restaurant identifier was provided.');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const data = await fetchTenantMenu(restaurantSlug, { includeUnavailable: true });
      setRestaurant(data.restaurant);
      setItems(Object.values(data.menu).flat());
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Failed to load the menu.');
      setStatus('error');
    }
  }, [restaurantSlug]);

  useEffect(() => {
    load();
  }, [load]);

  // Live sync across admin devices/tabs (same room the customer app uses).
  useEffect(() => {
    if (!restaurantSlug) return undefined;

    const socket = getSocket();
    socket.emit('join-menu-room', { restaurantSlug });

    const upsert = (item) => {
      setItems((prev) => {
        const exists = prev.some((i) => i._id === item._id);
        return exists ? prev.map((i) => (i._id === item._id ? item : i)) : [...prev, item];
      });
    };
    const remove = ({ itemId }) => setItems((prev) => prev.filter((i) => i._id !== itemId));

    socket.on('menu-item-created', upsert);
    socket.on('menu-item-updated', upsert);
    socket.on('menu-item-deleted', remove);

    return () => {
      socket.off('menu-item-created', upsert);
      socket.off('menu-item-updated', upsert);
      socket.off('menu-item-deleted', remove);
    };
  }, [restaurantSlug]);

  const addItem = useCallback(
    async (payload) => {
      const created = await createMenuItem(restaurantSlug, payload);
      // The socket broadcast will also deliver this item back to us, but
      // applying it optimistically here means the dashboard that actually
      // performed the action doesn't wait on a network round trip to see it.
      setItems((prev) => (prev.some((i) => i._id === created._id) ? prev : [...prev, created]));
    },
    [restaurantSlug]
  );

  const editItem = useCallback(
    async (itemId, payload) => {
      const updated = await updateMenuItem(restaurantSlug, itemId, payload);
      setItems((prev) => prev.map((i) => (i._id === itemId ? updated : i)));
    },
    [restaurantSlug]
  );

  const toggleAvailability = useCallback(
    async (itemId, isAvailable) => {
      // Optimistic flip — the toggle should feel instantaneous under the
      // owner's thumb; the REST call (and the resulting broadcast to
      // customers) confirms it a moment later.
      setItems((prev) => prev.map((i) => (i._id === itemId ? { ...i, isAvailable } : i)));
      try {
        await updateItemAvailability(restaurantSlug, itemId, isAvailable);
      } catch (err) {
        // Roll back on failure — e.g. the item was deleted from another tab
        // between render and click.
        setItems((prev) => prev.map((i) => (i._id === itemId ? { ...i, isAvailable: !isAvailable } : i)));
        throw err;
      }
    },
    [restaurantSlug]
  );

  const removeItem = useCallback(
    async (itemId) => {
      await deleteMenuItem(restaurantSlug, itemId);
      setItems((prev) => prev.filter((i) => i._id !== itemId));
    },
    [restaurantSlug]
  );

  return { items, restaurant, status, error, reload: load, addItem, editItem, toggleAvailability, removeItem };
}

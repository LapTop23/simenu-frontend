// hooks/useTenantMenu.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchTenantMenu, verifyTableScan } from '../lib/api';
import { getSocket } from '../lib/socket';

/**
 * Inserts/updates/removes a single item within the `{ category: [items] }`
 * shape returned by the API, without needing a full menu refetch. Kept as a
 * pure helper (not inlined into the reducer-ish setState calls below) so the
 * three live-update handlers can share the exact same insertion/removal logic.
 */
function upsertItemInMenu(menu, item) {
  const next = {};
  Object.keys(menu).forEach((category) => {
    // Drop any existing copy of this item first — covers the case where an
    // edit changes its category, so it doesn't linger under the old one.
    next[category] = menu[category].filter((existing) => existing._id !== item._id);
  });
  if (!next[item.category]) next[item.category] = [];
  next[item.category] = [...next[item.category], item].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  // Drop categories that ended up empty (e.g. the item's old category, if it moved).
  Object.keys(next).forEach((category) => {
    if (next[category].length === 0) delete next[category];
  });
  return next;
}

function removeItemFromMenu(menu, itemId) {
  const next = {};
  Object.keys(menu).forEach((category) => {
    const remaining = menu[category].filter((item) => item._id !== itemId);
    if (remaining.length > 0) next[category] = remaining;
  });
  return next;
}

/**
 * useTenantMenu — reads the dynamic tenant context straight from the URL
 * (e.g. `?res=savory-foods&table=5`) and loads that tenant's menu from the
 * backend. This is the single source of truth for "which restaurant, which
 * table" for the entire page — every other component receives that context
 * as props rather than re-reading the URL itself.
 *
 * Also joins the tenant's live 'menu' room over Socket.IO so that any
 * availability toggle, edit, or deletion an owner makes from the admin
 * dashboard appears on this already-open page INSTANTLY — no refresh, no
 * polling. This is the customer-facing half of the real-time menu management
 * feature; the admin half lives in hooks/useAdminMenu.js.
 *
 * Returns:
 *   { restaurantSlug, tableNumber, restaurant, categories, menu, status, error, reload }
 * where `status` is one of 'loading' | 'success' | 'error'.
 */
export function useTenantMenu() {
  const searchParams = useSearchParams();
  const restaurantSlug = searchParams.get('res');
  const tableNumber = searchParams.get('table');
  const scanKey = searchParams.get('key');

  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState({});
  // 'checking' | 'valid' | 'invalid' — gates ordering until a real QR scan
  // (this visit or a still-unexpired one from earlier) has been confirmed.
  const [sessionStatus, setSessionStatus] = useState('checking');

  const load = useCallback(async () => {
    if (!restaurantSlug) {
      setStatus('error');
      setError('No restaurant was specified. Scan your table\'s QR code again to reload the menu.');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const data = await fetchTenantMenu(restaurantSlug, { includeUnavailable: true });
      setRestaurant(data.restaurant);
      setCategories(data.categories || []);
      setMenu(data.menu || {});
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Something went wrong while loading the menu.');
      setStatus('error');
    }
  }, [restaurantSlug]);

  useEffect(() => {
    load();
  }, [load]);

  // Verifies a real QR scan (table + key in the URL) and stores the
  // resulting temporary session in localStorage, scoped to this specific
  // restaurant+table so it can't be reused elsewhere. If there's no key at
  // all (someone just typed a table number manually, with no real scan) and
  // no still-valid earlier session either, ordering gets blocked — see the
  // `sessionStatus` check in app/menu/page.jsx.
  useEffect(() => {
    if (!restaurantSlug || !tableNumber) return;

    const storageKey = `simenu_table_session_${restaurantSlug}_${tableNumber}`;

    if (!scanKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const { expiresAt } = JSON.parse(stored);
          if (expiresAt > Date.now()) {
            setSessionStatus('valid');
            return;
          }
        } catch {
          // Malformed stored value — fall through to 'invalid' below.
        }
      }
      setSessionStatus('invalid');
      return;
    }

    setSessionStatus('checking');
    verifyTableScan(restaurantSlug, tableNumber, scanKey)
      .then(({ sessionId, expiresAt }) => {
        localStorage.setItem(storageKey, JSON.stringify({ sessionId, expiresAt }));
        setSessionStatus('valid');
      })
      .catch(() => setSessionStatus('invalid'));
  }, [restaurantSlug, tableNumber, scanKey]);

  // Live menu updates — joins once the tenant is known, tears down its
  // listeners (but not the shared socket itself) on unmount or slug change.
  useEffect(() => {
    if (!restaurantSlug) return undefined;

    const socket = getSocket();
    socket.emit('join-menu-room', { restaurantSlug });

    const handleItemCreatedOrUpdated = (item) => {
      setMenu((prevMenu) => upsertItemInMenu(prevMenu, item));
      setCategories((prevCategories) =>
        prevCategories.includes(item.category) ? prevCategories : [...prevCategories, item.category].sort()
      );
    };

    const handleItemDeleted = ({ itemId }) => {
      setMenu((prevMenu) => removeItemFromMenu(prevMenu, itemId));
    };

    socket.on('menu-item-created', handleItemCreatedOrUpdated);
    socket.on('menu-item-updated', handleItemCreatedOrUpdated);
    socket.on('menu-item-deleted', handleItemDeleted);

    return () => {
      socket.off('menu-item-created', handleItemCreatedOrUpdated);
      socket.off('menu-item-updated', handleItemCreatedOrUpdated);
      socket.off('menu-item-deleted', handleItemDeleted);
    };
  }, [restaurantSlug]);

  return {
    restaurantSlug,
    tableNumber: tableNumber || null,
    sessionStatus,
    restaurant,
    categories,
    menu,
    status,
    error,
    reload: load,
  };
}

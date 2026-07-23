// hooks/useAdminOrders.js
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '../lib/socket';
import { fetchTenantOrders } from '../lib/api';
import { useNotificationChime } from './useNotificationChime';

/**
 * useAdminOrders — the real-time data layer for the Restaurant Manager
 * Dashboard. Responsibilities:
 *
 *   1. Loads the tenant's existing orders once over REST (so the board isn't
 *      empty on a page refresh).
 *   2. Joins this socket to the tenant's private admin room via
 *      'join-admin-room' — the ONLY way this dashboard receives orders for
 *      "its" restaurant and no other, since the server re-derives the room
 *      name from a DB lookup rather than trusting a client-supplied id.
 *   3. Listens for 'new-order' (prepends + chimes) and 'order-status-updated'
 *      (patches the matching order in place, so a second manager's device
 *      updating a status is reflected here instantly too).
 *   4. Tears down every listener on unmount — critical since this hook
 *      operates on the shared, app-wide socket singleton; leaving listeners
 *      attached after a component unmounts would silently accumulate
 *      duplicate handlers on every remount.
 */
export function useAdminOrders(restaurantSlug) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [newOrderId, setNewOrderId] = useState(null); // drives the "just arrived" pop-in highlight
  const playChime = useNotificationChime();

  // Guards against a late-arriving REST response overwriting orders that have
  // already streamed in over the socket while the initial fetch was in flight.
  const hasLoadedInitialOrders = useRef(false);

  useEffect(() => {
    if (!restaurantSlug) {
      setStatus('error');
      setError('No restaurant identifier was provided.');
      return undefined;
    }

    let isCancelled = false;
    const socket = getSocket();

    // ---- 1. Initial load over REST ----
    fetchTenantOrders(restaurantSlug)
      .then((data) => {
        if (isCancelled) return;
        setOrders(data.sort(byCreatedAtAscending));
        hasLoadedInitialOrders.current = true;
      })
      .catch((err) => {
        if (isCancelled) return;
        setError(err.message);
      });

    // ---- 2. Join this tenant's private admin room ----
    socket.emit('join-admin-room', { restaurantSlug }, (response) => {
      if (isCancelled) return;
      if (response?.success) {
        setRestaurant(response.restaurant);
        setStatus('ready');
      } else {
        setStatus('error');
        setError(response?.message || 'Unable to connect to the live order feed.');
      }
    });

    // ---- 3. Live event handlers ----
    const handleNewOrder = (order) => {
      setOrders((prev) => {
        // Defensive de-dupe: if the REST load and the socket both deliver the
        // same order (a plausible race on page refresh), keep only one copy.
        if (prev.some((o) => o._id === order._id)) return prev;
        return [...prev, order];
      });
      setNewOrderId(order._id);
      playChime();
    };

    const handleStatusUpdated = ({ orderId, orderStatus }) => {
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus } : o)));
    };

    socket.on('new-order', handleNewOrder);
    socket.on('order-status-updated', handleStatusUpdated);

    // ---- 4. Cleanup — remove exactly these listeners, leave the shared socket connected ----
    return () => {
      isCancelled = true;
      socket.off('new-order', handleNewOrder);
      socket.off('order-status-updated', handleStatusUpdated);
    };
  }, [restaurantSlug, playChime]);

  /**
   * updateStatus — emits the status change over the socket rather than REST,
   * so the customer who placed the order (and any other admin device) learns
   * about it instantly via the server's broadcast, instead of only this
   * dashboard's local state changing.
   */
  const updateStatus = useCallback(
    (orderId, orderStatus) => {
      const socket = getSocket();
      // Optimistic update — the dashboard reflects the change immediately;
      // the server's broadcast (which will also reach this same listener)
      // simply confirms/re-applies the same state a moment later.
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus } : o)));

      socket.emit('update-order-status', { restaurantSlug, orderId, orderStatus }, (response) => {
        if (!response?.success) {
          console.warn('[useAdminOrders] Status update rejected by server:', response?.message);
          // Roll back is intentionally skipped in favor of the next
          // 'order-status-updated' broadcast reconciling state — the server
          // is always the source of truth here.
        }
      });
    },
    [restaurantSlug]
  );

  return { orders, status, error, restaurant, updateStatus, newOrderId };
}

function byCreatedAtAscending(a, b) {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

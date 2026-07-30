// app/menu/page.jsx
'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { CartProvider, useCart } from '../../context/CartContext';
import { useTenantMenu } from '../../hooks/useTenantMenu';
import { getSocket } from '../../lib/socket';
import { fetchOrderById } from '../../lib/api';
import Header from '../../components/Header';
import CategoryBar from '../../components/CategoryBar';
import MenuItemCard from '../../components/MenuItemCard';
import ModifierSheet from '../../components/ModifierSheet';
import FloatingCartBar from '../../components/FloatingCartBar';
import CartDrawer from '../../components/CartDrawer';
import CheckoutFooter from '../../components/CheckoutFooter';

/**
 * `useSearchParams` (used inside useTenantMenu) requires a Suspense boundary
 * in the Next.js App Router — this default export is intentionally just a
 * thin wrapper so the real page logic can assume search params are ready.
 */
export default function MenuPageRoute() {
  return (
    <Suspense fallback={<FullScreenState message="Loading menu…" />}>
      <CartProvider>
        <MenuPage />
      </CartProvider>
    </Suspense>
  );
}

function MenuPage() {
  const { restaurantSlug, tableNumber, sessionStatus, restaurant, categories, menu, status, error, reload } = useTenantMenu();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeModifierItem, setActiveModifierItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [liveOrderStatus, setLiveOrderStatus] = useState(null);
  const [isRestoringOrder, setIsRestoringOrder] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeDietaryFilters, setActiveDietaryFilters] = useState([]);

  useEffect(() => {
    document.title = restaurant?.name ? `${restaurant.name} — Menu` : 'Menu — SiMenu';
  }, [restaurant]);

  const { addItem, lines, clearCart } = useCart();
  const currency = restaurant?.currency || 'PKR';

  // Every dietary tag actually in use across this menu — shown as filter
  // chips only when relevant, rather than always showing all 9 possible
  // tags regardless of whether this restaurant uses them.
  const availableDietaryFilters = useMemo(() => {
    const tagSet = new Set();
    Object.values(menu).flat().forEach((item) => (item.dietaryTags || []).forEach((tag) => tagSet.add(tag)));
    return [...tagSet].sort();
  }, [menu]);

  const toggleDietaryFilter = (tag) => {
    setActiveDietaryFilters((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const visibleItems = useMemo(() => {
    const categoryItems = activeCategory === 'All' ? Object.values(menu).flat() : menu[activeCategory] || [];
    if (activeDietaryFilters.length === 0) return categoryItems;
    // A dish must match EVERY selected filter (e.g. "Vegan" + "Gluten-Free"
    // narrows to dishes that are both, not either) — the more filters
    // selected, the more specific the result, matching how a customer with
    // multiple genuine restrictions would expect this to behave.
    return categoryItems.filter((item) => activeDietaryFilters.every((tag) => (item.dietaryTags || []).includes(tag)));
  }, [menu, activeCategory, activeDietaryFilters]);

  const handleAddDirect = (item, modifiers, quantity = 1) => {
    addItem({
      itemId: item._id,
      name: item.name,
      basePrice: item.price,
      quantity,
      modifiers,
      image: item.images?.[0],
    });
  };

  const handleModifierConfirm = (modifiers, quantity) => {
    handleAddDirect(activeModifierItem, modifiers, quantity);
    setActiveModifierItem(null);
  };

  /**
   * Order submission over Socket.IO — the real-time path required by the
   * platform's live-ordering feature. The socket emits 'place-order' with an
   * ack callback; the server responds synchronously (from the client's point
   * of view) with either the created order or a validation error, so this
   * still feels like a normal async request/response to the UI even though
   * it never touches `fetch`. A REST fallback (`lib/api.js#submitOrder`)
   * remains available for non-realtime integrations, but the live checkout
   * flow uses the socket exclusively, matching how the admin dashboard learns
   * about the order the instant it's placed.
   */
  const handleCheckout = () => {
    setIsSubmitting(true);
    setCheckoutError(null);

    const socket = getSocket();

    // The session created by a real QR scan (see hooks/useTenantMenu.js) —
    // this is what the backend actually checks before creating the order.
    // Reading it fresh here (rather than trusting a stale value from when
    // the page first loaded) means a session that expires mid-visit is
    // caught at the moment of checkout, not silently ignored.
    const storedSession = JSON.parse(
      localStorage.getItem(`simenu_table_session_${restaurantSlug}_${tableNumber}`) || 'null'
    );

    const orderPayload = {
      tableNumber: tableNumber || 'N/A',
      sessionId: storedSession?.sessionId,
      paymentMethod: 'Cash',
      items: lines.map((line) => ({
        menuItemId: line.itemId,
        quantity: line.quantity,
        selectedModifiers: line.modifiers.map((m) => ({ groupName: m.groupName, optionName: m.optionName })),
      })),
    };

    socket.emit('place-order', { restaurantSlug, order: orderPayload }, (response) => {
      setIsSubmitting(false);

      if (!response?.success) {
        setCheckoutError(response?.message || 'Something went wrong while placing your order.');
        return;
      }

      setOrderConfirmation(response.order);
      setLiveOrderStatus(response.order.orderStatus);
      clearCart();
      setIsCartOpen(false);
      setIsModalVisible(true);

      // Remember this order on THIS device, scoped to this restaurant, so
      // reopening the page later (a refresh, an accidental back-button
      // press, or coming back from another app) can find it again — the
      // live tracking connection is no longer lost the moment the
      // confirmation popup is closed.
      if (restaurantSlug && response.order?._id) {
        localStorage.setItem(
          `simenu_active_order_${restaurantSlug}`,
          JSON.stringify({ orderId: response.order._id, orderNumber: response.order.orderNumber })
        );
      }
    });
  };

  /**
   * Live status tracking for the order just placed. The server automatically
   * joins THIS socket to `order:<id>` the moment 'place-order' succeeds (see
   * backend sockets/index.js), so simply listening for 'order-status-updated'
   * here is enough — no extra "subscribe" event needed. The listener is
   * scoped to the confirmed order's id and torn down on unmount / whenever a
   * new order is confirmed, so it can never leak across orders or pages.
   */
  useEffect(() => {
    if (!orderConfirmation?._id) return undefined;

    const socket = getSocket();
    const handleStatusUpdate = (payload) => {
      if (String(payload.orderId) === String(orderConfirmation._id)) {
        setLiveOrderStatus(payload.orderStatus);
        if (payload.orderStatus === 'Completed' || payload.orderStatus === 'Cancelled') {
          localStorage.removeItem(`simenu_active_order_${restaurantSlug}`);
        }
      }
    };

    socket.on('order-status-updated', handleStatusUpdate);

    // Cleanup: always remove the exact listener reference that was added —
    // this is what prevents duplicate handlers (and memory leaks) from
    // piling up on the shared singleton socket across re-renders/navigations.
    return () => {
      socket.off('order-status-updated', handleStatusUpdate);
    };
  }, [orderConfirmation?._id]);

  /**
   * On page load, check whether THIS device has a remembered active order
   * for THIS restaurant. If so: fetch its current status, rejoin its live
   * order room over the socket (since a fresh page load means a brand-new
   * socket connection that was never in that order's room to begin with —
   * see the 'track-order' handler in the backend), and surface the
   * persistent tracking banner. Completed/cancelled orders are cleared out
   * automatically rather than tracked forever.
   */
  useEffect(() => {
    if (!restaurantSlug) return;

    const storageKey = `simenu_active_order_${restaurantSlug}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      setIsRestoringOrder(false);
      return;
    }

    let storedOrder;
    try {
      storedOrder = JSON.parse(stored);
    } catch {
      localStorage.removeItem(storageKey);
      setIsRestoringOrder(false);
      return;
    }

    fetchOrderById(restaurantSlug, storedOrder.orderId)
      .then((order) => {
        if (order.orderStatus === 'Completed' || order.orderStatus === 'Cancelled') {
          localStorage.removeItem(storageKey);
        } else {
          setOrderConfirmation(order);
          setLiveOrderStatus(order.orderStatus);
          setIsModalVisible(false); // Restored quietly into the banner, not popping the modal open unprompted.
          getSocket().emit('track-order', { orderId: order._id });
        }
      })
      .catch(() => {
        // The remembered order no longer exists (deleted, or from a stale/
        // different restaurant) — clear the dead reference quietly rather
        // than showing an error for something the customer never asked for.
        localStorage.removeItem(storageKey);
      })
      .finally(() => setIsRestoringOrder(false));
  }, [restaurantSlug]);

  if (status === 'loading') return <FullScreenState message="Loading menu…" />;
  if (status === 'error') return <FullScreenState message={error} isError onRetry={reload} />;

  if (sessionStatus === 'checking') {
    return <FullScreenState message="Verifying your table…" />;
  }
  if (sessionStatus === 'invalid') {
    return (
      <FullScreenState
        message="This link isn't valid, or it's expired. Please scan the QR code on your table to order."
        isError
      />
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-32">
      <Header restaurant={restaurant} tableNumber={tableNumber} />

      {/*
        Persistent tracking banner — visible whenever there's an active order
        being tracked but its modal isn't currently open. This is what fixes
        "closing the confirmation popup loses the connection to my order":
        the order itself is still being tracked in the background the whole
        time; this banner is just a way to reopen that same live view.
      */}
      {orderConfirmation && !isModalVisible && (
        <button
          type="button"
          onClick={() => setIsModalVisible(true)}
          className="sticky top-0 z-30 flex w-full items-center justify-center gap-2 bg-saffron/15 px-4 py-2.5 text-xs font-semibold text-saffron-dark"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saffron-dark" />
          Track your order #{orderConfirmation.orderNumber} — {liveOrderStatus || orderConfirmation.orderStatus}
        </button>
      )}

      <CategoryBar categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />

      {availableDietaryFilters.length > 0 && (
        <div className="mx-auto flex max-w-lg gap-2 overflow-x-auto px-4 pb-2 pt-1">
          {availableDietaryFilters.map((tag) => {
            const isActive = activeDietaryFilters.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleDietaryFilter(tag)}
                className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  isActive ? 'border-basil bg-basil text-paper' : 'border-sand bg-white text-ink/60'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      <main className="mx-auto max-w-lg space-y-3 px-4 py-4">
        {visibleItems.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink/50">No items in this category yet.</p>
        ) : (
          visibleItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={{ ...item, currency }}
              onAddDirect={(clickedItem, modifiers) => handleAddDirect(clickedItem, modifiers)}
              onRequireModifiers={setActiveModifierItem}
            />
          ))
        )}
      </main>

      <CheckoutFooter />

      <FloatingCartBar currency={currency} onViewCart={() => setIsCartOpen(true)} />

      {activeModifierItem && (
        <ModifierSheet
          item={activeModifierItem}
          onConfirm={handleModifierConfirm}
          onClose={() => setActiveModifierItem(null)}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          currency={currency}
          tableNumber={tableNumber}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
          isSubmitting={isSubmitting}
          submitError={checkoutError}
        />
      )}

      {orderConfirmation && isModalVisible && (
        <OrderConfirmedModal
          order={orderConfirmation}
          liveStatus={liveOrderStatus}
          onClose={() => setIsModalVisible(false)}
        />
      )}
    </div>
  );
}

function OrderConfirmedModal({ order, liveStatus, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-6">
      <div className="animate-pop-in w-full max-w-sm rounded-3xl bg-white p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-basil/10">
          <span className="text-2xl text-basil">✓</span>
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">Order sent to the kitchen</h2>
        <p className="mt-1 font-mono text-sm text-ink/50">#{order.orderNumber}</p>

        {/* Live status, pushed instantly the moment the kitchen updates it. */}
        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-saffron/15 px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saffron-dark" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wide text-saffron-dark">
            {liveStatus || order.orderStatus}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-basil py-3 font-semibold text-paper"
        >
          Back to menu
        </button>
      </div>
    </div>
  );
}

function FullScreenState({ message, isError = false, onRetry }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className={isError ? 'text-sm text-chili' : 'text-sm text-ink/60'}>{message}</p>
      {isError && onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-basil px-5 py-2 text-sm text-paper">
          Try again
        </button>
      )}
    </div>
  );
}

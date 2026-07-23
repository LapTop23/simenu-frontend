// context/CartContext.jsx
'use client';

import { createContext, useContext, useMemo, useReducer } from 'react';

const CartContext = createContext(null);

/**
 * Builds a stable identity for a cart line: the same dish with the same
 * modifier selections should stack quantity into one line; the same dish
 * with a DIFFERENT modifier selection must become its own separate line
 * (a plain burger and a burger with extra cheese are not the same order line).
 */
function buildCartLineId(itemId, modifiers) {
  const modifierKey = [...modifiers]
    .map((m) => `${m.groupName}:${m.optionName}`)
    .sort()
    .join('|');
  return `${itemId}__${modifierKey}`;
}

function calculateUnitPrice(basePrice, modifiers) {
  const modifiersTotal = modifiers.reduce((sum, m) => sum + (m.priceDelta || 0), 0);
  return basePrice + modifiersTotal;
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { itemId, name, basePrice, quantity, modifiers, image } = action.payload;
      const cartLineId = buildCartLineId(itemId, modifiers);
      const unitPrice = calculateUnitPrice(basePrice, modifiers);

      const existingLine = state.lines.find((line) => line.cartLineId === cartLineId);

      if (existingLine) {
        return {
          lines: state.lines.map((line) =>
            line.cartLineId === cartLineId ? { ...line, quantity: line.quantity + quantity } : line
          ),
        };
      }

      return {
        lines: [
          ...state.lines,
          { cartLineId, itemId, name, basePrice, unitPrice, quantity, modifiers, image },
        ],
      };
    }

    case 'UPDATE_QUANTITY': {
      const { cartLineId, quantity } = action.payload;
      if (quantity <= 0) {
        return { lines: state.lines.filter((line) => line.cartLineId !== cartLineId) };
      }
      return {
        lines: state.lines.map((line) => (line.cartLineId === cartLineId ? { ...line, quantity } : line)),
      };
    }

    case 'REMOVE_LINE':
      return { lines: state.lines.filter((line) => line.cartLineId !== action.payload.cartLineId) };

    case 'CLEAR_CART':
      return { lines: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [] });

  const value = useMemo(() => {
    const totalItems = state.lines.reduce((sum, line) => sum + line.quantity, 0);
    const totalAmount = state.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

    return {
      lines: state.lines,
      totalItems,
      totalAmount,
      addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
      updateQuantity: (cartLineId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { cartLineId, quantity } }),
      removeLine: (cartLineId) => dispatch({ type: 'REMOVE_LINE', payload: { cartLineId } }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * useCart — the only sanctioned way to read/mutate cart state. Throws loudly
 * if used outside a CartProvider rather than silently returning undefined,
 * so a missing provider is caught in development, not in a customer's order.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a <CartProvider>.');
  }
  return context;
}

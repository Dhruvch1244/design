"use client";

import * as React from "react";
import { cartReducer, EMPTY_CART, type CartAction, type CartState } from "@/lib/design-shop/cart";

/**
 * The React boundary around lib/cart.ts. Every rule about what a cart *is*
 * lives in that file; this one only wires the reducer to a context and owns
 * the drawer's open/closed flag, so any page can add a line and have the
 * Sheet open in response without prop-drilling a handler through it.
 */

const STORAGE_KEY = "sableroot-cart";

interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

function readStoredLines(): unknown {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as { lines?: unknown }).lines : [];
  } catch {
    // A corrupt or unparseable payload is not worth blocking the shop over.
    // The reducer's sanitizer treats anything non-array as "no lines".
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(cartReducer, EMPTY_CART);
  const [isOpen, setOpen] = React.useState(false);

  /*
   * Reading storage after mount rather than in the reducer's initializer is
   * deliberate: the server has no localStorage, so an initializer that read
   * it would make the server-rendered tree and the first client render
   * disagree for a value the server cannot possibly know.
   *
   * It is a single `dispatch` rather than a read plus a separate
   * `setHydrated(true)` — restoring the lines and recording that the restore
   * happened are one transition, and splitting them across two state updates
   * is what produces a frame where the cart looks both loaded and empty.
   */
  React.useEffect(() => {
    dispatch({ type: "restore", lines: readStoredLines() });
  }, []);

  React.useEffect(() => {
    if (!state.restored) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines: state.lines }));
    } catch {
      // Storage quota, or private mode. The cart still works for this session;
      // only persistence is lost, which is not worth surfacing as an error.
    }
  }, [state.lines, state.restored]);

  const value = React.useMemo<CartContextValue>(
    () => ({ state, dispatch, isOpen, setOpen }),
    [state, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

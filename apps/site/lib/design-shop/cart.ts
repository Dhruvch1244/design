/**
 * Cart state and every rule that operates on it.
 *
 * Like lib/catalog.ts, this file imports no React and no Next. It is a
 * reducer plus a handful of selectors, so the cart's behaviour — merging a
 * duplicate line, clamping quantity, undoing a removal, deciding shipping —
 * can be reasoned about (and tested) without rendering anything.
 *
 * The removal model is the dsgn philosophy's third pillar taken literally:
 * "never mutate the source of truth in place". A removed line is *moved* to
 * `lastRemoved` with its original index, not deleted, so undo is "put it
 * back where it was" rather than a reconstructed inverse operation. There is
 * no code path in this file that loses a line's data.
 */

import type { ArtMotif, ArtTone } from "./catalog";

export interface CartLine {
  /** slug + sorted option ids — two identical configurations share one line. */
  id: string;
  slug: string;
  name: string;
  /** Price of one unit *with* its selected options applied, in pence. */
  unitPrice: number;
  qty: number;
  /** "1 kg · Filter / drip", already rendered by describeSelection(). */
  optionSummary: string;
  tone: ArtTone;
  motif: ArtMotif;
}

export interface RemovedLine {
  line: CartLine;
  index: number;
}

export interface CartState {
  lines: CartLine[];
  /** The one line most recently removed, retained so undo is exact. */
  lastRemoved: RemovedLine | null;
  /**
   * Whether the persisted cart has been read back yet. It lives in cart state
   * rather than a separate React `useState` on purpose: the UI has to be able
   * to tell "empty" apart from "not loaded yet" (a checkout page that flashes
   * "there is nothing to check out" before restoring is a bug, not a loading
   * state), and one reducer transition is safer than two independent state
   * updates that have to land in the same render to look right.
   */
  restored: boolean;
}

export const EMPTY_CART: CartState = { lines: [], lastRemoved: null, restored: false };

/** Hard ceiling per line. Stock is not modelled; this is a sanity clamp. */
export const MAX_QTY = 12;

export type CartAction =
  | { type: "add"; line: Omit<CartLine, "qty">; qty: number }
  | { type: "setQty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "undoRemove" }
  | { type: "dismissRemoved" }
  | { type: "restore"; lines: unknown }
  | { type: "clear" };

/**
 * Takes whatever came back out of storage and keeps only the lines that are
 * structurally sound. Structure is gatekept; content is not — a line whose
 * option summary or price no longer matches today's catalog is kept as it is
 * rather than "corrected", because silently rewriting someone's bag is worse
 * than showing them what is actually in it.
 */
function sanitizeLines(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const lines: CartLine[] = [];
  for (const candidate of input) {
    if (typeof candidate !== "object" || candidate === null) continue;
    const line = candidate as Partial<CartLine>;
    if (typeof line.id !== "string" || typeof line.slug !== "string") continue;
    if (typeof line.name !== "string" || typeof line.unitPrice !== "number") continue;
    if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) continue;
    if (seen.has(line.id)) continue;
    seen.add(line.id);
    lines.push({
      id: line.id,
      slug: line.slug,
      name: line.name,
      unitPrice: Math.round(line.unitPrice),
      qty: Math.min(MAX_QTY, Math.max(1, Math.trunc(Number(line.qty) || 1))),
      optionSummary: typeof line.optionSummary === "string" ? line.optionSummary : "",
      tone: (line.tone ?? "sand") as CartLine["tone"],
      motif: (line.motif ?? "grain") as CartLine["motif"],
    });
  }
  return lines;
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "restore": {
      // Idempotent, and never clobbers a cart that was added to between mount
      // and the storage read landing.
      if (state.restored) return state;
      return {
        lines: state.lines.length > 0 ? state.lines : sanitizeLines(action.lines),
        lastRemoved: null,
        restored: true,
      };
    }

    case "add": {
      const existing = state.lines.find((l) => l.id === action.line.id);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.id === action.line.id
              ? { ...l, qty: Math.min(MAX_QTY, l.qty + action.qty) }
              : l,
          ),
        };
      }
      return {
        ...state,
        lines: [...state.lines, { ...action.line, qty: Math.min(MAX_QTY, action.qty) }],
      };
    }

    case "setQty": {
      // Dropping to zero is a removal, and takes the same undoable path — so
      // a stepper held down past 1 is as recoverable as pressing "remove".
      if (action.qty <= 0) return cartReducer(state, { type: "remove", id: action.id });
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.id === action.id ? { ...l, qty: Math.min(MAX_QTY, action.qty) } : l,
        ),
      };
    }

    case "remove": {
      const index = state.lines.findIndex((l) => l.id === action.id);
      if (index === -1) return state;
      return {
        ...state,
        lines: state.lines.filter((l) => l.id !== action.id),
        lastRemoved: { line: state.lines[index], index },
      };
    }

    case "undoRemove": {
      if (!state.lastRemoved) return state;
      const { line, index } = state.lastRemoved;
      const lines = [...state.lines];
      lines.splice(Math.min(index, lines.length), 0, line);
      return { ...state, lines, lastRemoved: null };
    }

    case "dismissRemoved":
      return { ...state, lastRemoved: null };

    case "clear":
      // `restored` survives a clear — it describes whether storage has been
      // read, not whether the cart has anything in it.
      return { ...EMPTY_CART, restored: state.restored };

    default:
      return state;
  }
}

export function lineKey(slug: string, selection: Record<string, string>): string {
  const parts = Object.keys(selection)
    .sort()
    .map((k) => `${k}:${selection[k]}`);
  return [slug, ...parts].join("|");
}

export function itemCount(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.qty, 0);
}

export function subtotal(state: CartState): number {
  return state.lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
}

/** Orders at or above this subtotal ship standard for free. */
export const FREE_SHIPPING_THRESHOLD = 4000;

export interface DeliveryOption {
  id: string;
  label: string;
  detail: string;
  /** Pence. Standard is waived above the threshold; see shippingFor(). */
  price: number;
}

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard",
    label: "Standard",
    detail: "Tracked 48, arrives in 2–4 working days",
    price: 395,
  },
  {
    id: "express",
    label: "Express",
    detail: "Next working day if ordered before 14:00",
    price: 895,
  },
  {
    id: "collect",
    label: "Collect from the roastery",
    detail: "North bank counter, ready in about an hour",
    price: 0,
  },
];

export function shippingFor(deliveryId: string, cartSubtotal: number): number {
  const option = DELIVERY_OPTIONS.find((d) => d.id === deliveryId);
  if (!option) return 0;
  if (option.id === "standard" && cartSubtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return option.price;
}

/** Pence remaining before standard shipping is free, or 0 once it is. */
export function untilFreeShipping(cartSubtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
}

export function freeShippingProgress(cartSubtotal: number): number {
  return Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
}

export function orderTotal(state: CartState, deliveryId: string): number {
  const goods = subtotal(state);
  return goods + shippingFor(deliveryId, goods);
}

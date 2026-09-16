// Simple cart store backed by localStorage with subscription pattern.
import { useEffect, useSyncExternalStore } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image_url: string | null;
  quantity: number;
};

const KEY = "phyto_cart_v1";
const listeners = new Set<() => void>();
let items: CartItem[] = [];
let hydrated = false;

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
  } catch {}
  hydrated = true;
}

export const cart = {
  get(): CartItem[] {
    hydrate();
    return items;
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  add(item: Omit<CartItem, "quantity">, qty = 1) {
    hydrate();
    const existing = items.find((i) => i.id === item.id);
    if (existing) existing.quantity += qty;
    else items = [...items, { ...item, quantity: qty }];
    persist();
  },
  setQty(id: string, qty: number) {
    hydrate();
    if (qty <= 0) items = items.filter((i) => i.id !== id);
    else items = items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
    persist();
  },
  remove(id: string) {
    hydrate();
    items = items.filter((i) => i.id !== id);
    persist();
  },
  clear() {
    items = [];
    persist();
  },
};

const emptySnapshot: CartItem[] = [];

export function useCart() {
  const items = useSyncExternalStore(
    (cb) => cart.subscribe(cb),
    () => cart.get(),
    () => emptySnapshot,
  );
  useEffect(() => {
    // ensure hydration on client
    cart.get();
    listeners.forEach((l) => l());
  }, []);
  return items;
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

import { currencyStore, type CurrencyCode } from "./currency";

export function formatPrice(amount: number, currency?: string) {
  if (currency && currency !== "EUR") {
    return currencyStore.format(amount, currency as CurrencyCode);
  }
  return currencyStore.format(amount);
}

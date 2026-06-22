"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { buildCartItemKey } from "@/lib/product-variants";

export type CartItem = {
  key: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  weightId?: string;
  weightLabel?: string;
  weightKilograms?: number;
  flavorId?: string;
  flavorLabel?: string;
  flavorPricePerKg?: number;
  customPhotoName?: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "key">, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const defaultCartContext: CartContextValue = {
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clear: () => {},
};

const CartContext = createContext<CartContextValue>(defaultCartContext);

const STORAGE_KEY = "ock-cart";
function readInitialCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readInitialCartItems);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      addItem: (item, quantity = 1) => {
        const key = buildCartItemKey(item.slug, item.weightId, item.flavorId);

        setItems((prev) => {
          const existing = prev.find((entry) => entry.key === key);
          if (existing) {
            return prev.map((entry) =>
              entry.key === key ? { ...entry, quantity: entry.quantity + quantity } : entry,
            );
          }

          return [...prev, { ...item, key, quantity }];
        });
      },
      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          setItems((prev) => prev.filter((entry) => entry.key !== key));
          return;
        }

        setItems((prev) =>
          prev.map((entry) => (entry.key === key ? { ...entry, quantity } : entry)),
        );
      },
      removeItem: (key) => {
        setItems((prev) => prev.filter((entry) => entry.key !== key));
      },
      clear: () => {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

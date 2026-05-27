"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Gig, PackageTier, GigPackage } from "../lib/types";

interface CartItem {
  gig: Gig;
  tier: PackageTier;
  pkg: GigPackage;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (gig: Gig, tier: PackageTier) => void;
  removeFromCart: (gigId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (gig: Gig, tier: PackageTier) => {
    const pkg = gig.packages[tier];
    setItems((prev) => {
      const existing = prev.find((i) => i.gig.id === gig.id && i.tier === tier);
      if (existing) return prev;
      return [...prev, { gig, tier, pkg, quantity: 1 }];
    });
  };

  const removeFromCart = (gigId: string) => {
    setItems((prev) => prev.filter((i) => i.gig.id !== gigId));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems: items.length,
        totalPrice: items.reduce((sum, i) => sum + i.pkg.price * i.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

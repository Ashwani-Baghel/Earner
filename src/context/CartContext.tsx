"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Gig, PackageTier, GigPackage } from "../lib/types";
import { useAuth } from "./AuthContext";

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
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);

  // 1. Initial load from localStorage (happens once on mount)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("earner_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Failed to load cart from localStorage", err);
    }
    setInitialized(true);
  }, []);

  // Helper to persist locally
  const persistLocally = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("earner_cart", JSON.stringify(newItems));
  };

  // 2. Sync with DB when user logs in or page reloads with user
  useEffect(() => {
    if (!initialized || !user) return;

    const syncWithServer = async () => {
      try {
        const token = await user.getIdToken();
        
        // Merge current local items into DB first
        if (items.length > 0) {
          const itemsToAdd = items.map(i => ({ gigId: i.gig.id, tier: i.tier }));
          await fetch("/api/cart", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ items: itemsToAdd })
          });
        }

        // Fetch the definitive merged cart from DB
        const res = await fetch("/api/cart", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.items) {
            persistLocally(data.items);
          }
        }
      } catch (err) {
        console.error("Failed to sync cart with DB", err);
      }
    };

    syncWithServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, initialized]); // Only run when user becomes available or auth state is resolved

  // 3. Actions
  const addToCart = async (gig: Gig, tier: PackageTier) => {
    const pkg = gig.packages[tier];
    
    // Check if exists locally
    const existing = items.find((i) => i.gig.id === gig.id && i.tier === tier);
    if (existing) return;

    const newItems = [...items, { gig, tier, pkg, quantity: 1 }];
    persistLocally(newItems);

    // Sync to DB if logged in
    if (user) {
      try {
        const token = await user.getIdToken();
        await fetch("/api/cart", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ items: [{ gigId: gig.id, tier }] })
        });
      } catch (err) {
        console.warn("Failed to sync cart addition to server", err);
      }
    }
  };

  const removeFromCart = async (gigId: string) => {
    const newItems = items.filter((i) => i.gig.id !== gigId);
    persistLocally(newItems);

    // Sync to DB if logged in
    if (user) {
      try {
        const token = await user.getIdToken();
        await fetch(`/api/cart?gigId=${gigId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (err) {
        console.warn("Failed to sync cart removal to server", err);
      }
    }
  };

  const clearCart = async () => {
    persistLocally([]);
    
    // Sync to DB if logged in
    if (user) {
      try {
        const token = await user.getIdToken();
        await fetch(`/api/cart?clearAll=true`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (err) {
        console.warn("Failed to clear server cart", err);
      }
    }
  };

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

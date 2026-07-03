"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

interface FavoritesContextType {
  favoriteIds: string[];
  favorites: any[];
  toggleFavorite: (gigId: string) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: [],
  favorites: [],
  toggleFavorite: async () => {},
  loading: true
});

export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) {
        setFavorites([]);
        setFavoriteIds([]);
        setLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/favorites", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFavorites(data);
          setFavoriteIds(data.map((f: any) => f.gigId));
        }
      } catch (error) {
        console.error("Failed to fetch favorites", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (gigId: string) => {
    if (!user) {
      toast.error("Please sign in to add to wishlist");
      return;
    }

    // Optimistic UI update
    const isCurrentlyFav = favoriteIds.includes(gigId);
    if (isCurrentlyFav) {
      setFavoriteIds(prev => prev.filter(id => id !== gigId));
      setFavorites(prev => prev.filter(f => f.gigId !== gigId));
    } else {
      setFavoriteIds(prev => [...prev, gigId]);
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ gigId })
      });
      
      if (!res.ok) throw new Error("Failed to toggle favorite");
      
      const data = await res.json();
      
      if (data.isFavorite) {
        toast.success("Added to wishlist!");
        // Re-fetch to get the full gig details for the wishlist page if it was added
        const freshRes = await fetch("/api/favorites", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          setFavorites(freshData);
        }
      } else {
        toast("Removed from wishlist", { icon: "🗑️" });
      }
    } catch (error) {
      // Revert optimistic update
      toast.error("Failed to update wishlist");
      if (isCurrentlyFav) {
        setFavoriteIds(prev => [...prev, gigId]);
      } else {
        setFavoriteIds(prev => prev.filter(id => id !== gigId));
      }
    }
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, favorites, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

"use client";

import { useFavorites } from "@/context/FavoritesContext";
import { Heart } from "lucide-react";

export function WishlistButton({ gigId }: { gigId: string }) {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const isSaved = favoriteIds.includes(gigId);

  return (
    <button 
      onClick={() => toggleFavorite(gigId)}
      className={`px-4 py-2 border border-[#e4e5e7] rounded-lg text-sm font-semibold flex items-center justify-center transition-all ${
        isSaved 
          ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100" 
          : "text-[#404145] hover:border-[#1dbf73] hover:text-[#1dbf73]"
      }`}
      title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
    </button>
  );
}

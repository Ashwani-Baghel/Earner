"use client";

import { useFavorites } from "@/context/FavoritesContext";
import { GigCard } from "@/components/gig/GigCard";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { favorites, loading } = useFavorites();

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        
        <div className="flex items-center gap-3 mb-8">
          <Heart size={28} className="text-red-500" fill="currentColor" />
          <h1 className="text-3xl font-black text-slate-900">Your Wishlist</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-lg h-72 border border-slate-200"></div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <Heart size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">Your wishlist is empty</h2>
            <p className="text-slate-500 mb-6">Explore thousands of gigs and save your favorites here.</p>
            <Link 
              href="/search" 
              className="inline-flex bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Explore Gigs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((fav) => (
              <GigCard key={fav.id} gig={fav.gig} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

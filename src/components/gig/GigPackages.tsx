"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, RefreshCw } from "lucide-react";
import type { Gig, PackageTier } from "../../lib/types";
import { Button } from "../ui/Button";
import { formatCurrency } from "../../lib/utils";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { Heart, AlertCircle } from "lucide-react";

interface GigPackagesProps {
  gig: Gig;
}

export function GigPackages({ gig }: GigPackagesProps) {
  const [activeTier, setActiveTier] = useState<PackageTier>("basic");
  const router = useRouter();
  const { addToCart } = useCart();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const isFavorite = favoriteIds.includes(gig.id);
  const isOwnGig = user?.uid === gig.seller.uid;

  const tiers: PackageTier[] = ["basic", "standard", "premium"];
  const pkg = gig?.packages?.[activeTier];

  if (!pkg) {
    return (
      <div className="bg-white rounded-xl border border-[#e4e5e7] p-5 text-center text-sm text-[#74767e]">
        Package information unavailable.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e4e5e7] overflow-hidden sticky top-20">
      {/* Tier tabs */}
      <div className="flex border-b border-[#e4e5e7]">
        {tiers.map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-all border-b-2 ${activeTier === tier
                ? "border-[#1dbf73] text-[#1dbf73]"
                : "border-transparent text-[#74767e] hover:text-[#404145]"
              }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Package details */}
      <div className="p-5">
        <div className="flex flex-col items-start gap-1 mb-3">
          <h3 className="font-bold text-[#404145] text-lg break-words break-all line-clamp-2">{pkg.name}</h3>
          <span className="text-2xl font-bold text-[#404145] mt-1">{formatCurrency(pkg.price)}</span>
        </div>
        <p className="text-sm text-[#74767e] mb-4 leading-relaxed break-words break-all line-clamp-[10]">{pkg.description}</p>

        <div className="flex items-center gap-4 mb-4 text-sm text-[#404145]">
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#74767e]" />
            {pkg.deliveryTime} day{pkg.deliveryTime > 1 ? "s" : ""} delivery
          </span>
          <span className="flex items-center gap-1.5">
            <RefreshCw size={14} className="text-[#74767e]" />
            {pkg.revisions === -1 ? "Unlimited" : pkg.revisions} revision{pkg.revisions !== 1 ? "s" : ""}
          </span>
        </div>

        <ul className="space-y-2 mb-5">
          {(pkg.features || []).map((feature: string) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-[#404145]">
              <Check size={14} className="text-[#1dbf73] flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 mb-3">
          {isOwnGig && (
            <div className="flex items-center gap-2 p-2.5 mb-1 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
              <AlertCircle size={14} className="shrink-0" />
              You cannot purchase your own gig.
            </div>
          )}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="lg"
              disabled={isOwnGig}
              onClick={() => {
                addToCart(gig, activeTier);
                router.push("/cart");
              }}
            >
              Continue ({formatCurrency(pkg.price)})
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled={isOwnGig}
              onClick={() => {
                addToCart(gig, activeTier);
                alert("Added to cart!");
              }}
              title="Add to Cart"
            >
              Add to Cart
            </Button>
          </div>
        </div>
        <Button variant="outline" className="w-full mb-3" size="md">
          Compare Packages
        </Button>
        <Button 
          variant="outline" 
          className={`w-full ${isFavorite ? "text-red-500 border-red-200 bg-red-50" : ""}`} 
          size="md"
          onClick={() => toggleFavorite(gig.id)}
        >
          <Heart size={16} className="mr-2" fill={isFavorite ? "currentColor" : "none"} />
          {isFavorite ? "Saved to Wishlist" : "Save to Wishlist"}
        </Button>
      </div>

      {/* Trust badges */}
      <div className="px-5 pb-4 border-t border-[#e4e5e7] pt-4">
        <div className="flex items-center justify-center gap-4 text-xs text-[#74767e]">
          <span>🔒 Secure payment</span>
          <span>✅ Money-back guarantee</span>
        </div>
      </div>
    </div>
  );
}

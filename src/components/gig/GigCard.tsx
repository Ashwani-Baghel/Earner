"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import type { Gig } from "../../lib/types";
import { StarRating } from "../ui/StarRating";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { formatCurrency } from "../../lib/utils";
import { useFavorites } from "../../context/FavoritesContext";

interface GigCardProps {
  gig: Gig;
  className?: string;
}

export function GigCard({ gig, className }: GigCardProps) {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const isFavorite = favoriteIds.includes(gig.id);

  return (
    <div className={`group bg-white rounded-lg border border-[#e4e5e7] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${className ?? ""}`}>
      {/* Thumbnail */}
      <Link href={`/gig/${gig.id}`} className="block relative overflow-hidden aspect-[4/3]">
        <Image
          src={gig.images[0] || "https://placehold.co/600x400?text=No+Image"}
          alt={gig.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {gig.bestSeller && <Badge variant="yellow" size="sm">Best Seller</Badge>}
          {gig.featured && !gig.bestSeller && <Badge variant="blue" size="sm">Featured</Badge>}
        </div>

        {/* Wishlist button */}
        <button
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 ${
            isFavorite ? "bg-white opacity-100 text-red-500" : "bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 text-[#74767e] hover:text-red-500"
          }`}
          aria-label={isFavorite ? "Remove from wishlist" : "Save to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(gig.id);
          }}
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </Link>

      {/* Body */}
      <div className="p-3">
        {/* Seller info */}
        <Link href={`/seller/${gig.seller.username}`} className="flex items-center gap-2 mb-2 group/seller">
          <Avatar src={gig.seller.avatar} alt={gig.seller.displayName} size="xs" online={gig.seller.isOnline} />
          <span className="text-xs font-medium text-[#404145] group-hover/seller:text-[#1dbf73] transition-colors truncate">
            {gig.seller.displayName}
          </span>
          {gig.seller.level === "top" && (
            <Badge variant="yellow" size="sm">Top Rated</Badge>
          )}
          {gig.seller.level === "pro" && (
            <Badge variant="blue" size="sm">PRO</Badge>
          )}
        </Link>

        {/* Title */}
        <Link href={`/gig/${gig.id}`}>
          <h3 className="text-sm text-[#404145] leading-snug mb-2 line-clamp-2 hover:text-[#1dbf73] transition-colors">
            {gig.title}
          </h3>
        </Link>

        {/* Rating */}
        <StarRating rating={gig.rating} reviewCount={gig.reviewCount} size="sm" />

        {/* Price */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e4e5e7]">
          <span className="text-xs text-[#74767e]">Starting at</span>
          <span className="text-base font-bold text-[#404145]">
            {formatCurrency(gig.packages.basic.price)}
          </span>
        </div>
      </div>
    </div>
  );
}

import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function StarRating({ rating, reviewCount, size = "sm", showCount = true, className }: StarRatingProps) {
  const sizes = { sm: { star: 12, text: "text-xs" }, md: { star: 14, text: "text-sm" }, lg: { star: 16, text: "text-base" } };
  const { star, text } = sizes[size];

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className={cn("font-semibold text-[#ffbe00]", text)}>{rating.toFixed(1)}</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={star}
            className={
              i < fullStars
                ? "fill-[#ffbe00] text-[#ffbe00]"
                : i === fullStars && hasHalf
                ? "fill-[#ffbe00] text-[#ffbe00] opacity-50"
                : "fill-none text-[#e4e5e7]"
            }
          />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className={cn("text-[#74767e]", text)}>({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}

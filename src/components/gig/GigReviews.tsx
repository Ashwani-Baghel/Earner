import { ThumbsUp } from "lucide-react";
import type { Review } from "../../lib/types";
import { StarRating } from "../ui/StarRating";
import { Avatar } from "../ui/Avatar";
import { formatRelativeTime } from "../../lib/utils";

interface GigReviewsProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

const RATING_LABELS: Record<number, string> = { 5: "Excellent", 4: "Very Good", 3: "Good", 2: "Fair", 1: "Poor" };

export function GigReviews({ reviews, rating, reviewCount }: GigReviewsProps) {
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[#404145] mb-6">
        Reviews ({reviewCount.toLocaleString()})
      </h2>

      {/* Rating breakdown */}
      <div className="flex flex-col sm:flex-row gap-6 p-5 bg-[#fafafa] rounded-xl border border-[#e4e5e7] mb-6">
        <div className="flex flex-col items-center justify-center min-w-[100px]">
          <span className="text-5xl font-bold text-[#404145]">{rating.toFixed(1)}</span>
          <StarRating rating={rating} size="md" showCount={false} />
          <span className="text-xs text-[#74767e] mt-1">Seller rating</span>
        </div>
        <div className="flex-1 space-y-2">
          {breakdown.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs text-[#74767e] w-16">{RATING_LABELS[star]}</span>
              <div className="flex-1 h-2 bg-[#e4e5e7] rounded-full overflow-hidden">
                <div className="h-full bg-[#1dbf73] rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-[#74767e] w-5 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-[#e4e5e7] pb-6">
            <div className="flex items-start gap-3 mb-3">
              <Avatar src={review.reviewer.avatar} alt={review.reviewer.name} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#404145]">{review.reviewer.name}</span>
                  <span className="text-xs text-[#74767e]">🌍 {review.reviewer.country}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating rating={review.rating} size="sm" showCount={false} />
                  <span className="text-xs text-[#74767e]">{formatRelativeTime(review.createdAt)}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#404145] leading-relaxed mb-2">{review.comment}</p>
            {review.sellerResponse && (
              <div className="mt-3 ml-4 pl-4 border-l-2 border-[#1dbf73] bg-[#fafafa] rounded-r-lg p-3">
                <p className="text-xs font-semibold text-[#1dbf73] mb-1">Response from seller</p>
                <p className="text-xs text-[#74767e]">{review.sellerResponse}</p>
              </div>
            )}
            <button className="flex items-center gap-1.5 mt-3 text-xs text-[#74767e] hover:text-[#404145] transition-colors">
              <ThumbsUp size={12} />
              Helpful ({review.helpful})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

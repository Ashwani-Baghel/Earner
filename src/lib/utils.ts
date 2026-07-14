import type { Gig, SearchFilters, SortOption } from "./types";

// ─── Format Helpers ───────────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  // price is stored in USD, convert to INR using approximate rate
  const inrAmount = Math.round(price * 83.5);
  return `From ₹${inrAmount.toLocaleString("en-IN")}`;
}

// Removed formatCurrency: use `useCurrency().formatPrice` from CurrencyContext instead.
export function formatCurrency(amount: number): string {
  // Converts USD to INR for static display (e.g., checkout page)
  const inrAmount = Math.round(amount * 83.5);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(inrAmount);
}

export function formatDelivery(days: number): string {
  if (days === 1) return "1 day delivery";
  return `${days} days delivery`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatReviewCount(count: number): string {
  if (count >= 1000) return `(${(count / 1000).toFixed(1)}k)`;
  return `(${count})`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  if (diffMonths > 0)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  return "just now";
}

export function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

// ─── Seller Level ─────────────────────────────────────────────────────────────

export function getSellerLevelLabel(
  level: string,
): { label: string; color: string } {
  switch (level) {
    case "new":
      return { label: "New Seller", color: "#74767e" };
    case "level1":
      return { label: "Level 1 Seller", color: "#1dbf73" };
    case "level2":
      return { label: "Level 2 Seller", color: "#19a463" };
    case "top":
      return { label: "Top Rated Seller", color: "#ffbe00" };
    case "pro":
      return { label: "Pro", color: "#1052d2" };
    default:
      return { label: "Seller", color: "#74767e" };
  }
}

// ─── Search & Filter ──────────────────────────────────────────────────────────

export function filterGigs(gigs: Gig[], filters: Partial<SearchFilters>): Gig[] {
  return gigs.filter((gig) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const match =
        gig.title.toLowerCase().includes(q) ||
        gig.description.toLowerCase().includes(q) ||
        gig.tags.some((t) => t.toLowerCase().includes(q)) ||
        gig.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filters.category && filters.category !== "all") {
      if (gig.category !== filters.category) return false;
    }

    if (filters.minPrice !== null && filters.minPrice !== undefined) {
      if (gig.packages.basic.price < filters.minPrice) return false;
    }

    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      if (gig.packages.basic.price > filters.maxPrice) return false;
    }

    if (filters.deliveryTime !== null && filters.deliveryTime !== undefined) {
      if (gig.packages.basic.deliveryTime > filters.deliveryTime) return false;
    }

    if (filters.sellerLevel) {
      if (gig.seller.level !== filters.sellerLevel) return false;
    }

    if (filters.rating !== null && filters.rating !== undefined) {
      if (gig.rating < filters.rating) return false;
    }

    if (filters.onlineSellers) {
      if (!gig.seller.isOnline) return false;
    }

    return true;
  });
}

export function sortGigs(gigs: Gig[], sort: SortOption): Gig[] {
  const clone = [...gigs];
  switch (sort) {
    case "best_selling":
      return clone.sort((a, b) => b.reviewCount - a.reviewCount);
    case "newest":
      return clone.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "price_asc":
      return clone.sort(
        (a, b) => a.packages.basic.price - b.packages.basic.price,
      );
    case "price_desc":
      return clone.sort(
        (a, b) => b.packages.basic.price - a.packages.basic.price,
      );
    case "level":
      const levelOrder = { pro: 0, top: 1, level2: 2, level1: 3, new: 4 };
      return clone.sort(
        (a, b) =>
          (levelOrder[a.seller.level] ?? 5) - (levelOrder[b.seller.level] ?? 5),
      );
    default:
      return clone;
  }
}

// ─── URL Helpers ──────────────────────────────────────────────────────────────

export function buildSearchUrl(
  query: string,
  filters?: Partial<SearchFilters>,
): string {
  const params = new URLSearchParams({ q: query });
  if (filters?.category) params.set("cat", filters.category);
  if (filters?.minPrice) params.set("min", String(filters.minPrice));
  if (filters?.maxPrice) params.set("max", String(filters.maxPrice));
  if (filters?.deliveryTime)
    params.set("days", String(filters.deliveryTime));
  return `/search?${params.toString()}`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ─── Image Helpers ────────────────────────────────────────────────────────────

export function getGigImage(seed: string, w = 400, h = 300): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export function getAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
}

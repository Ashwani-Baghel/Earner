"use client";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search, Star, Loader2, Package, RefreshCw,
  FileText, Smartphone, ChevronRight,
} from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";

interface Gig {
  id: string;
  title: string;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  seller: { id: string; name: string; avatar: string | null };
  basicPackage: { price: number };
}

function BuyerDashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const [fetching, setFetching]           = useState(true);

  const [gigsByCategory, setGigsByCategory] = useState<Record<string, Gig[]>>({});
  const [error, setError]                 = useState<string | null>(null);

  /* ── Auth guard ── */
  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/"); return; }
    if (user.hasRole && user.role === "SELLER") { router.push("/seller/dashboard"); return; }
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") { router.push("/admin"); return; }
  }, [user, loading, router]);

  /* ── Fetch real gigs from DB ── */
  const fetchGigs = async () => {
    if (!user) return;
    if (user.role === "SELLER") {
      setFetching(false);
      return;
    }
    setFetching(true);
    setError(null);
    try {
      const res = await fetch("/api/gigs?limit=50");
      if (!res.ok) throw new Error(`Failed to load gigs (${res.status})`);
      const data: Gig[] = await res.json();

      // Group by category
      // If a category is selected, only group gigs for that category
      const grouped: Record<string, Gig[]> = {};
      if (selectedCategory) {
        grouped[selectedCategory] = data.filter(gig => gig.category === selectedCategory);
      } else {
        data.forEach((gig) => {
          const cat = gig.category || "Other";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(gig);
        });
      }
      setGigsByCategory(grouped);
    } catch (e: any) {
      setError(e.message ?? "Could not load gigs.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchGigs(); }, [user, selectedCategory]); // eslint-disable-line


  if (loading || (fetching && Object.keys(gigsByCategory).length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-teal-600" size={36} />
          <p className="text-sm text-slate-500 font-medium">Loading services…</p>
        </div>
      </div>
    );
  }

  const firstName     = user?.displayName?.split(" ")[0] ?? "there";
  const totalCategories = Object.keys(gigsByCategory).length;
  const totalGigs       = Object.values(gigsByCategory).flat().length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Welcome Banner ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                Welcome back, {firstName} 👋
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                {totalGigs > 0
                  ? `${totalGigs} services available across ${totalCategories} categories`
                  : "Explore the platform and find great talent"}
              </p>
            </div>
            <button
              onClick={fetchGigs}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              <RefreshCw size={15} className={fetching ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-10">

        {/* ── Tip Cards Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Search,    label: "Find a service", sub: "Search across 500+ categories",   href: "/search" },
            { icon: FileText,  label: "Post a brief",   sub: "Get tailored offers from sellers", href: "/search" },
            { icon: Smartphone,label: "My Orders",      sub: "Track your active orders",         href: "/orders" },
          ].map(({ icon: Icon, label, sub, href }) => (
            <Link
              key={label}
              href={href}
              className="group bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-teal-600" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-teal-500 ml-auto flex-shrink-0 transition-colors" />
            </Link>
          ))}
        </div>

        {/* ── Error State ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={fetchGigs} className="underline hover:no-underline font-semibold">Retry</button>
          </div>
        )}

        {/* ── Gigs by Category ── */}
        {totalGigs > 0 ? (
          <div className="space-y-12">
            {Object.entries(gigsByCategory).map(([category, gigs]) => (
              <div key={category}>
                {/* Category header */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-900">{category}</h2>
                  <Link
                    href={`/search?category=${encodeURIComponent(category)}`}
                    className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                  >
                    See all <ChevronRight size={14} />
                  </Link>
                </div>

                {/* Horizontal scroll of gig cards */}
                <div className="flex gap-5 overflow-x-auto pb-3 no-scrollbar snap-x">
                  {gigs.map((gig) => {
                    const price = typeof gig.basicPackage === "object" && gig.basicPackage !== null
                      ? Number((gig.basicPackage as any).price ?? 0)
                      : 0;
                    const thumb = Array.isArray(gig.images) && gig.images[0]
                      ? gig.images[0]
                      : `https://picsum.photos/seed/${gig.id}/400/300`;

                    return (
                      <Link
                        key={gig.id}
                        href={`/gig/${gig.id}`}
                        className="group flex-shrink-0 w-[260px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all snap-start"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          <img
                            src={thumb}
                            alt={gig.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Card Body */}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar
                              src={gig.seller?.avatar}
                              alt={gig.seller?.name ?? "Seller"}
                              size="xs"
                              initials={gig.seller?.name?.[0]}
                            />
                            <span className="text-xs font-semibold text-slate-600 truncate">
                              {gig.seller?.name ?? "Seller"}
                            </span>
                          </div>

                          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-teal-700 transition-colors">
                            {gig.title}
                          </h3>

                          <div className="flex items-center gap-1 mb-3">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold text-slate-800">
                              {gig.rating > 0 ? gig.rating.toFixed(1) : "New"}
                            </span>
                            {gig.reviewCount > 0 && (
                              <span className="text-xs text-slate-400">({gig.reviewCount})</span>
                            )}
                          </div>

                          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Starting at</span>
                            <span className="text-sm font-bold text-slate-900">
                              ₹{price > 0 ? Math.round(price * 83.5).toLocaleString("en-IN") : "41,999"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-6">
              <Package size={36} className="text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {selectedCategory ? `No services available in ${selectedCategory} yet` : "No services available yet"}
            </h2>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              Sellers are creating gigs right now. Once they're approved by our admin team, they'll appear here automatically.
            </p>
            <button
              onClick={fetchGigs}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-700 transition-colors shadow-sm"
            >
              <RefreshCw size={16} /> Check Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuyerDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-teal-600" size={36} /></div>}>
      <BuyerDashboardContent />
    </Suspense>
  );
}

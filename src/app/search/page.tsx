"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, Suspense } from "react";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { filterGigs, sortGigs } from "@/lib/utils";
import type { SearchFilters as ISearchFilters, SortOption } from "@/lib/types";
import { GigCard } from "@/components/gig/GigCard";
import { SearchFilters } from "@/components/search/SearchFilters";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Best Match" },
  { value: "best_selling", label: "Best Selling" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "level", label: "Seller Level" },
];

function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  const [filters, setFilters] = useState<Partial<ISearchFilters>>({ query: q });
  const [sort, setSort] = useState<SortOption>("relevance");
  const [mobileFilters, setMobileFilters] = useState(false);

  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const category = params.get("category");
    const subcategory = params.get("subcategory");
    
    let url = "/api/gigs?";
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (subcategory) url += `subcategory=${encodeURIComponent(subcategory)}&`;
    if (q) url += `q=${encodeURIComponent(q)}&`;

    fetch(url)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setGigs(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [params, q]);

  const results = useMemo(() => {
    const f = filterGigs(gigs, { ...filters, query: q || filters.query });
    return sortGigs(f, sort);
  }, [gigs, filters, q, sort]);

  return (
    <div className="container-earner py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#404145]">
          {q ? `Results for "${q}"` : "All Services"}
        </h1>
        <p className="text-sm text-[#74767e] mt-1">{results.length} services available</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters - desktop */}
        <div className="hidden lg:block">
          <SearchFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort + mobile filter toggle */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <button onClick={() => setMobileFilters(!mobileFilters)} className="lg:hidden flex items-center gap-2 border border-[#e4e5e7] rounded-lg px-3 py-2 text-sm text-[#404145] hover:border-[#1dbf73] transition-colors">
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-[#74767e]">Sort by:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}
                className="border border-[#e4e5e7] rounded-lg px-3 py-2 text-sm text-[#404145] focus:outline-none focus:border-[#1dbf73]">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Mobile filters */}
          {mobileFilters && (
            <div className="lg:hidden mb-5">
              <SearchFilters filters={filters} onChange={setFilters} />
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-teal-600" size={40} />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-[#404145] mb-2">No services found for your search</h3>
              <p className="text-[#74767e]">Try adjusting your search or filters to find what you&apos;re looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#1dbf73] border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

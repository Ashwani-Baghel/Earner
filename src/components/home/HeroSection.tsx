"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import {
  SEARCH_PLACEHOLDERS,
  QUICK_SEARCHES,
  TRUSTED_BRANDS,
} from "@/lib/constants";

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  /* ── rotate placeholder text ── */
  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % SEARCH_PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 250);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handlePill = (q: string) =>
    router.push(`/search?q=${encodeURIComponent(q)}`);

  return (
    <section className="relative overflow-hidden w-full bg-slate-900">
      {/* ── Background photo ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80')",
        }}
      />

      {/* ── Gradient: Teal/Slate overlay ── */}
      <div className="absolute inset-0 z-0 bg-slate-900/70 mix-blend-multiply" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-teal-900/80 to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-40 flex flex-col justify-center min-h-[600px]">
        {/* Headline */}
        <h1 className="text-white font-black tracking-tight leading-[1.1] mb-8 drop-shadow-md max-w-3xl" style={{ fontSize: "clamp(3rem, 5vw, 4.5rem)" }}>
          Find the perfect <i className="font-serif italic font-light text-teal-400">freelance</i> services for your business
        </h1>

        {/* ── Search bar ── */}
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-[850px] bg-white rounded-full shadow-2xl p-2 transition-all focus-within:ring-4 focus-within:ring-teal-500/30 h-16 sm:h-20"
        >
          <div className="flex items-center pl-6 pr-3 text-slate-400">
            <Search size={24} />
          </div>
          <input
            id="hero-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for any service..."
            className="flex-1 px-2 text-lg text-slate-800 bg-transparent outline-none placeholder-slate-400 font-medium"
          />
          <button
            type="submit"
            aria-label="Search"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 sm:px-12 rounded-full h-full flex-shrink-0 transition-all shadow-md ml-2"
          >
            Search
          </button>
        </form>

        {/* ── Quick-search pills ── */}
        <div className="mt-8 flex flex-wrap items-center gap-3 w-full max-w-[850px]">
          <span className="text-white/80 font-medium mr-2 drop-shadow-sm">Popular:</span>
          {[
            "Website Development",
            "Logo Design",
            "SEO",
            "Video Editing",
          ].map((item) => (
            <button
              key={item}
              onClick={() => handlePill(item)}
              className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold text-white border border-white/40 bg-white/5 hover:bg-white/20 hover:border-white transition-all backdrop-blur-sm"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* ── Trusted-by logos at base ── */}
      <div className="absolute bottom-0 left-0 w-full z-10 pb-6 lg:pb-8 pt-12 bg-gradient-to-t from-[#00220a] to-transparent">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-wrap items-center gap-6">
          <span className="text-white/80 font-[600] text-[14px] shrink-0 mr-4">
            Trusted by:
          </span>
          {TRUSTED_BRANDS.map((brand) => (
            <div key={brand.name} className="flex items-center justify-center text-white/90 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <span dangerouslySetInnerHTML={{ __html: `<span style="${brand.style}">${brand.wordmark}</span>` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

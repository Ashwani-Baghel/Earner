"use client";

import { useState, useEffect } from "react";
import { useCms } from "@/context/CmsContext";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export function PromoSlider({ placement }: { placement: "HOMEPAGE" | "CATEGORY" | "SELLER" | "SEARCH" | "LANDING_PAGE" }) {
  const { banners } = useCms();
  const [activeBanners, setActiveBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!banners || !banners.items) return;
    const now = new Date().toISOString().split("T")[0];
    
    const validBanners = banners.items.filter((b: any) => {
      // Must be active override
      if (!b.isActive) return false;
      // Must include this placement
      if (!b.placements || !b.placements.includes(placement)) return false;
      // Must be within date schedule
      if (b.startDate && b.startDate > now) return false;
      if (b.endDate && b.endDate < now) return false;
      return true;
    });

    setActiveBanners(validBanners);
  }, [banners, placement]);

  // Auto cycle
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (closed || activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex];

  return (
    <div className="relative w-full bg-slate-900 overflow-hidden text-white group">
      {/* Background Image with Overlay */}
      {current.imageUrl && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{ backgroundImage: `url(${current.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 container-earner mx-auto px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[160px]">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 drop-shadow-md">
            {current.title}
          </h2>
          {current.description && (
            <p className="text-slate-200 text-sm md:text-base font-medium drop-shadow-md">
              {current.description}
            </p>
          )}
        </div>

        {current.ctaText && current.ctaUrl && (
          <Link 
            href={current.ctaUrl}
            className="shrink-0 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg"
          >
            {current.ctaText} <ArrowRight size={18} />
          </Link>
        )}
      </div>

      {/* Controls: Dots */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {activeBanners.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${idx === currentIndex ? "w-6 bg-teal-400" : "w-2 bg-white/40 hover:bg-white/60"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Dismiss Button */}
      <button 
        onClick={() => setClosed(true)}
        className="absolute top-4 right-4 z-20 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}

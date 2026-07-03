"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/mock-data/categories";
import { CategoryMegaMenu } from "./CategoryMegaMenu";

export function CategorySlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (catId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredCat(catId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCat(null);
    }, 150);
  };

  const checkArrows = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkArrows();
    window.addEventListener("resize", checkArrows);
    return () => window.removeEventListener("resize", checkArrows);
  }, []);

  const scrollBy = (offset: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkArrows, 300);
    }
  };

  return (
    <div className="hidden lg:block border-t border-[#e4e5e7] relative group">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scrollBy(-300)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md p-1.5 rounded-full text-[#404145] hover:bg-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Categories Container */}
      <div 
        ref={containerRef}
        onScroll={checkArrows}
        className="flex overflow-x-auto no-scrollbar whitespace-nowrap text-[14px] font-medium text-[#74767e] scroll-smooth relative"
      >
        <div className="relative flex-shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-3 border-b-2 border-transparent text-[13px] font-semibold text-[#404145] hover:border-[#1dbf73] hover:text-[#1dbf73] transition-colors whitespace-nowrap"
          >
            Trending <span>🔥</span>
          </Link>
        </div>
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="relative flex-shrink-0"
            onMouseEnter={() => handleMouseEnter(cat.id)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={`/categories/${cat.slug}`}
              className={`flex items-center gap-1.5 px-4 py-3 transition-colors whitespace-nowrap border-b-2 text-[13px] font-medium ${
                hoveredCat === cat.id
                  ? "border-[#1dbf73] text-[#404145] font-semibold"
                  : "border-transparent hover:text-[#404145]"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scrollBy(300)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md p-1.5 rounded-full text-[#404145] hover:bg-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Mega menu */}
      {hoveredCat && (() => {
        const cat = CATEGORIES.find(c => c.id === hoveredCat);
        return cat ? (
          <div
            className="absolute left-0 right-0 z-50 shadow-lg"
            onMouseEnter={() => handleMouseEnter(hoveredCat)}
            onMouseLeave={handleMouseLeave}
          >
            <CategoryMegaMenu category={cat} onClose={() => setHoveredCat(null)} />
          </div>
        ) : null;
      })()}
    </div>
  );
}

"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { POPULAR_SERVICE_CARDS } from "@/lib/constants";

export function PopularServices() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({
        left: dir === "left" ? -260 : 260,
        behavior: "smooth",
      });
  };

  return (
    <section className="py-24 bg-white">
      <div className="container-fiverr">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-12">
          Popular professional services
        </h2>

        <div className="relative group/carousel">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="
              absolute -left-6 top-1/2 -translate-y-1/2 z-10
              h-12 w-12 rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.15)]
              flex items-center justify-center text-slate-700 hover:text-teal-600
              hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all
              opacity-0 group-hover/carousel:opacity-100
            "
          >
            <ChevronLeft size={24} />
          </button>

          {/* Card strip */}
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto pb-4 no-scrollbar"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {POPULAR_SERVICE_CARDS.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className="group/card relative flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all"
                style={{
                  width: "250px",
                  height: "345px",
                  scrollSnapAlign: "start",
                }}
              >
                {/* Background image covering whole card */}
                <Image
                  src={card.image}
                  alt={card.label}
                  fill
                  className="object-cover group-hover/card:scale-110 transition-transform duration-500"
                  unoptimized
                />
                {/* Gradient overlay for text legibility */}
                <div
                  className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent"
                />

                {/* Text — top-left */}
                <div className="absolute top-0 left-0 right-0 z-10 p-6 flex flex-col gap-2">
                  <span className="text-white text-sm font-medium opacity-90 block">
                    {card.label.includes('Logo') ? 'Build your brand' : 
                     card.label.includes('Web') ? 'Customize your site' : 
                     card.label.includes('Video') ? 'Engage your audience' : 
                     card.label.includes('SEO') ? 'Unlock growth' : 
                     card.label.includes('Marketing') ? 'Reach more customers' : 
                     'Level up your business'}
                  </span>
                  <span className="text-white font-bold text-2xl leading-tight">
                    {card.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="
              absolute -right-6 top-1/2 -translate-y-1/2 z-10
              h-12 w-12 rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.15)]
              flex items-center justify-center text-slate-700 hover:text-teal-600
              hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all
              opacity-0 group-hover/carousel:opacity-100
            "
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}

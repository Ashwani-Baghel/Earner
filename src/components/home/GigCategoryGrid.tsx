import Link from "next/link";
import { useState, useRef } from "react";
import { useCms } from "../../context/CmsContext";

export function GigCategoryGrid() {
  const { categories } = useCms();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    if (sliderRef.current) {
      setScrollPosition(sliderRef.current.scrollLeft);
    }
  };

  return (
    <section className="py-24 bg-[#f7f7f7]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#222325] mb-12">
          You need it, we've got it
        </h2>
        <div 
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 no-scrollbar snap-x snap-mandatory"
        >
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center justify-center gap-4 p-6 bg-white border border-[#e4e5e7] hover:border-[#1dbf73] rounded-2xl shadow-sm hover:shadow-xl transition-all h-[160px] relative overflow-hidden flex-shrink-0 w-[160px] snap-start"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#1dbf73]/5 rounded-full group-hover:scale-150 transition-transform"></div>
              <div className="text-4xl text-[#222325] group-hover:scale-110 transition-transform z-10">{cat.icon}</div>
              <span className="text-sm sm:text-base font-bold text-[#222325] leading-tight z-10 text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

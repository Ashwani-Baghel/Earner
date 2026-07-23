"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GigGalleryProps {
  images: string[];
  title: string;
}

export function GigGallery({ images, title }: GigGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const validImages = images?.filter(Boolean).length > 0 ? images.filter(Boolean) : ["https://placehold.co/600x400?text=No+Image"];

  const prev = () => setCurrent((c) => (c - 1 + validImages.length) % validImages.length);
  const next = () => setCurrent((c) => (c + 1) % validImages.length);

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-[#e4e5e7]">
        {/* Main image */}
        <div className="relative aspect-video max-h-[600px] w-full bg-[#f5f5f5] cursor-zoom-in" onClick={() => setLightbox(true)}>
          <Image src={validImages[current]} alt={`${title} - image ${current + 1}`} fill className="object-cover" unoptimized />
          {validImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {validImages.length > 1 && (
          <div className="flex gap-2 p-3 bg-[#fafafa]">
            {validImages.map((img, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`relative flex-shrink-0 h-16 w-24 rounded-md overflow-hidden ring-2 transition-all ${i === current ? "ring-[#1dbf73]" : "ring-transparent hover:ring-[#b5b6ba]"}`}>
                <Image src={img} alt="" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setLightbox(false)}>
            <X size={28} />
          </button>
          <div className="relative w-[90vw] max-w-4xl aspect-video max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={validImages[current]} alt={title} fill className="object-contain" unoptimized />
          </div>
          {validImages.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

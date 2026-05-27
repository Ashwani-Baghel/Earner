"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { StarRating } from "../ui/StarRating";
import { Avatar } from "../ui/Avatar";

const TESTIMONIALS = [
  { id: 1, name: "James Mitchell", role: "CEO, TechStartup Inc.", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=james2", rating: 5, text: "Fiverr has been a game-changer for our startup. We've hired designers, developers, and marketers — all top-tier professionals. The quality and speed is unmatched." },
  { id: 2, name: "Sarah Chen", role: "Marketing Director, GrowthCo", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=sarah2", rating: 5, text: "I've tried many freelance platforms but Fiverr consistently delivers the best results. The talent pool is extraordinary and the platform makes collaboration seamless." },
  { id: 3, name: "David Kumar", role: "Founder, ContentFirst", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=david2", rating: 5, text: "Our content strategy transformed completely after hiring writers and SEO specialists through Fiverr. Our organic traffic grew 300% in just 6 months!" },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);

  const t = TESTIMONIALS[current];

  return (
    <section className="py-16">
      <div className="container-fiverr">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#404145]">What they say about Fiverr</h2>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#e4e5e7] p-8 md:p-12 text-center shadow-sm">
            <Quote size={40} className="text-[#e4e5e7] mx-auto mb-6" />
            <p className="text-lg text-[#404145] leading-relaxed mb-8 italic">&ldquo;{t.text}&rdquo;</p>
            <div className="flex flex-col items-center gap-3">
              <Avatar src={t.avatar} alt={t.name} size="lg" />
              <div>
                <p className="font-bold text-[#404145]">{t.name}</p>
                <p className="text-sm text-[#74767e]">{t.role}</p>
              </div>
              <StarRating rating={t.rating} size="md" showCount={false} />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev} className="h-10 w-10 flex items-center justify-center rounded-full border border-[#e4e5e7] hover:border-[#1dbf73] hover:text-[#1dbf73] transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-[#1dbf73]" : "w-2 bg-[#e4e5e7]"}`}
                />
              ))}
            </div>
            <button onClick={next} className="h-10 w-10 flex items-center justify-center rounded-full border border-[#e4e5e7] hover:border-[#1dbf73] hover:text-[#1dbf73] transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

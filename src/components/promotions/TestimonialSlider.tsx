"use client";

import { useState, useEffect } from "react";
import { useCms } from "@/context/CmsContext";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";

export function TestimonialSlider() {
  const { testimonials } = useCms();
  const [activeTestimonials, setActiveTestimonials] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!testimonials || !testimonials.items) return;
    
    // Filter active and sort by displayOrder
    const valid = testimonials.items
      .filter((t: any) => t.isActive)
      .sort((a: any, b: any) => a.displayOrder - b.displayOrder);

    setActiveTestimonials(valid);
  }, [testimonials]);

  // Auto cycle
  useEffect(() => {
    if (activeTestimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeTestimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTestimonials.length]);

  if (activeTestimonials.length === 0) return null;

  const current = activeTestimonials[currentIndex];

  const next = () => setCurrentIndex((p) => (p + 1) % activeTestimonials.length);
  const prev = () => setCurrentIndex((p) => (p - 1 + activeTestimonials.length) % activeTestimonials.length);

  return (
    <div className="w-full bg-teal-50/50 py-16 lg:py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-100 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-teal-100 rounded-full blur-[100px] opacity-50"></div>
      </div>

      <div className="container-earner relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {testimonials?.title || "Loved by businesses worldwide"}
          </h2>
          <p className="text-lg text-slate-600">
            {testimonials?.subtitle || "See what our clients are saying about their experience working with Earner freelancers."}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-teal-900/5">
          <Quote className="absolute top-8 left-8 text-teal-100 w-16 h-16 -z-10 transform -rotate-6" />
          
          <div className="flex flex-col items-center text-center">
            {/* Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  className={i < current.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} 
                />
              ))}
            </div>

            {/* Review */}
            <p className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed mb-8">
              "{current.review}"
            </p>

            {/* User Info */}
            <div className="flex flex-col items-center">
              {current.profileImage ? (
                <img 
                  src={current.profileImage} 
                  alt={current.name} 
                  className="w-16 h-16 rounded-full object-cover mb-4 border-2 border-teal-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xl mb-4">
                  {current.name.charAt(0)}
                </div>
              )}
              <h4 className="font-bold text-slate-900 text-lg">{current.name}</h4>
              <p className="text-slate-500 text-sm">
                {current.designation}{current.company ? `, ${current.company}` : ''}
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          {activeTestimonials.length > 1 && (
            <>
              <button 
                onClick={prev}
                className="absolute top-1/2 -left-4 md:-left-6 transform -translate-y-1/2 w-12 h-12 bg-white border border-slate-100 shadow-lg rounded-full flex items-center justify-center text-slate-600 hover:text-teal-600 hover:scale-105 transition-all z-20"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={next}
                className="absolute top-1/2 -right-4 md:-right-6 transform -translate-y-1/2 w-12 h-12 bg-white border border-slate-100 shadow-lg rounded-full flex items-center justify-center text-slate-600 hover:text-teal-600 hover:scale-105 transition-all z-20"
              >
                <ChevronRight size={24} />
              </button>

              {/* Dots */}
              <div className="absolute -bottom-12 left-0 w-full flex justify-center gap-2">
                {activeTestimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentIndex ? "bg-teal-600 w-8" : "bg-teal-200 hover:bg-teal-300"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

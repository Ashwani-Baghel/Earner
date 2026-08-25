"use client";

import { useCms } from "@/context/CmsContext";
import { PromoSlider } from "@/components/promotions/PromoSlider";
import { TestimonialSlider } from "@/components/promotions/TestimonialSlider";
import { Gift, Zap, Sparkles } from "lucide-react";
import Link from "next/link";

export default function PromotionsPage() {
  const { banners } = useCms();
  
  // Find all active banners for LANDING_PAGE to see if we have any
  const now = new Date().toISOString().split("T")[0];
  const activeLandingPromos = (banners?.items || []).filter((b: any) => {
    if (!b.isActive) return false;
    if (!b.placements?.includes("LANDING_PAGE")) return false;
    if (b.startDate && b.startDate > now) return false;
    if (b.endDate && b.endDate < now) return false;
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* ── Main Slider ── */}
      <div className="bg-slate-900 border-b border-slate-800 shadow-xl">
        <PromoSlider placement="LANDING_PAGE" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-teal-100">
            <Sparkles size={16} /> Exclusive Offers
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Current Promotions & Campaigns</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Discover the latest deals, featured categories, and special events happening right now on Earner. Check back often as we run exclusive, time-limited campaigns!
          </p>
        </div>

        {/* List of active promos if there are multiple */}
        {activeLandingPromos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeLandingPromos.map((promo: any) => (
              <div key={promo.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                  {promo.imageUrl ? (
                    <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
                      <Gift size={48} className="text-teal-200" />
                    </div>
                  )}
                  {promo.endDate && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      Ends {new Date(promo.endDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{promo.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-grow">{promo.description}</p>
                  
                  {promo.ctaUrl && (
                    <Link 
                      href={promo.ctaUrl}
                      className="w-full py-3.5 bg-slate-900 hover:bg-teal-600 text-white text-center font-bold rounded-xl transition-colors shadow-md mt-auto"
                    >
                      {promo.ctaText || "Explore Offer"}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={32} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No active promotions right now</h3>
            <p className="text-slate-600 mb-8">We don't have any featured campaigns running at this exact moment. Check back soon for discounts, new seller highlights, and festival sales!</p>
            <Link href="/" className="inline-flex bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-xl transition-colors">
              Return to Homepage
            </Link>
          </div>
        )}

      </div>
      
      {/* ── Testimonials ── */}
      <TestimonialSlider />
    </div>
  );
}

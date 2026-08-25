"use client";

import { useCms } from "@/context/CmsContext";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Search, HelpCircle, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function HelpCenterPage() {
  const { faqs } = useCms();
  
  // Filter for General/Public FAQs or BOTH
  const publicFaqs = (faqs?.items || []).filter((faq: any) => faq.target === "GENERAL" || faq.target === "BOTH");

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* ── Hero Section ── */}
      <div className="bg-slate-900 text-white pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6">How can we help?</h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text" 
              placeholder="Search for articles, topics, or questions..." 
              className="w-full bg-white text-slate-900 rounded-full py-4 pl-14 pr-6 text-lg focus:outline-none focus:ring-4 focus:ring-teal-500/50 shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 mb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-4">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Getting Started</h3>
            <p className="text-slate-500 mb-6 flex-grow">Learn the basics of Earner and how to set up your account for success.</p>
            <Link href="/register" className="text-teal-600 font-bold hover:underline">Read Guide &rarr;</Link>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-4">
              <HelpCircle size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Buying & Selling</h3>
            <p className="text-slate-500 mb-6 flex-grow">Everything you need to know about payments, orders, and delivery.</p>
            <Link href="/categories" className="text-amber-600 font-bold hover:underline">Explore Services &rarr;</Link>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
              <MessageCircle size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Contact Support</h3>
            <p className="text-slate-500 mb-6 flex-grow">Can't find what you're looking for? Our team is here to help 24/7.</p>
            <button className="text-indigo-600 font-bold hover:underline">Submit a Ticket &rarr;</button>
          </div>
        </div>
      </div>

      {/* ── FAQs Section ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600">Find quick answers to the most common questions.</p>
        </div>
        
        {publicFaqs.length > 0 ? (
          <FaqAccordion faqs={publicFaqs} />
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No general FAQs available at the moment.</p>
          </div>
        )}
      </div>

    </div>
  );
}

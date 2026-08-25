"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  faqs: FAQ[];
  helpLink?: string;
}

export function DashboardFaqWidget({ faqs, helpLink = "/help" }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl mb-12 border border-slate-800">
      <div className="flex flex-col lg:flex-row">
        
        {/* ── Left Side: Banner ── */}
        <div className="lg:w-1/3 p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-md border border-white/10 shadow-inner">
              <HelpCircle size={28} />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tight">Need some help?</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              We've compiled answers to the most common questions from our users to help you succeed on Earner.
            </p>
          </div>
          
          <div className="relative z-10">
            <Link 
              href={helpLink} 
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl transition-colors backdrop-blur-md border border-white/5"
            >
              Visit Help Center <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        
        {/* ── Right Side: Accordion ── */}
        <div className="lg:w-2/3 bg-white p-8 lg:p-10">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {faqs.slice(0, 5).map((faq) => (
              <div 
                key={faq.id} 
                className={`border rounded-2xl overflow-hidden bg-white transition-all duration-300 ${openId === faq.id ? 'border-teal-500/30 shadow-md shadow-teal-500/5' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left bg-white focus:outline-none group"
                >
                  <span className={`font-bold pr-8 transition-colors ${openId === faq.id ? 'text-teal-700' : 'text-slate-800 group-hover:text-slate-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${openId === faq.id ? 'bg-teal-50' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
                    <ChevronDown 
                      className={`transform transition-transform duration-300 ${openId === faq.id ? "rotate-180 text-teal-600" : "text-slate-400"}`} 
                      size={18} 
                    />
                  </div>
                </button>
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${openId === faq.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <div className="p-5 pt-0 text-slate-600 leading-relaxed border-t border-slate-50/0 mt-1 whitespace-pre-wrap text-sm">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {faqs.length > 5 && (
            <div className="mt-6 text-center">
              <Link href={helpLink} className="text-sm font-bold text-teal-600 hover:text-teal-700 hover:underline">
                View all {faqs.length} questions
              </Link>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

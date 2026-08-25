"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  faqs: FAQ[];
  title?: string;
}

export function FaqAccordion({ faqs, title }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      {title && <h3 className="text-2xl font-bold text-slate-900 mb-6">{title}</h3>}
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div 
            key={faq.id} 
            className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:border-teal-500/30"
          >
            <button
              onClick={() => toggle(faq.id)}
              className="w-full flex items-center justify-between p-5 text-left bg-white focus:outline-none"
            >
              <span className="font-bold text-slate-800 pr-8">{faq.question}</span>
              <ChevronDown 
                className={`text-slate-400 transform transition-transform duration-300 flex-shrink-0 ${openId === faq.id ? "rotate-180 text-teal-600" : ""}`} 
                size={20} 
              />
            </button>
            <div 
              className={`grid transition-all duration-300 ease-in-out ${openId === faq.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="p-5 pt-0 text-slate-600 leading-relaxed border-t border-slate-50 mt-2 whitespace-pre-wrap">
                  {faq.answer}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

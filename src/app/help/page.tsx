"use client";

import { useState } from "react";
import { useCms } from "@/context/CmsContext";
import { useAuth } from "@/context/AuthContext";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Search, HelpCircle, FileText, MessageCircle, Ticket, MessageSquare, Inbox, BookOpen, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { TicketsTab } from "@/components/support/TicketsTab";
import { LiveChatTab } from "@/components/support/LiveChatTab";
import { InquiriesTab } from "@/components/support/InquiriesTab";

type TabType = "help-center" | "tickets" | "chat" | "inquiries";

export default function HelpCenterPage() {
  const { faqs } = useCms();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("help-center");
  
  // Filter for General/Public FAQs or BOTH
  const publicFaqs = (faqs?.items || []).filter((faq: any) => faq.target === "GENERAL" || faq.target === "BOTH");

  const tabs = [
    { id: "help-center", label: "Help Center", icon: BookOpen },
    { id: "tickets", label: "My Tickets", icon: Ticket },
    { id: "chat", label: "Live Chat", icon: MessageSquare },
    { id: "inquiries", label: "My Inquiries", icon: Inbox },
  ] as const;

  const renderNotLoggedIn = (featureName: string) => (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm text-center px-6">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-slate-400" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-3">Sign in to access {featureName}</h2>
      <p className="text-slate-500 mb-8 max-w-md">You need to be logged into your Earner account to view your support history, tickets, and use live chat.</p>
      <div className="flex gap-4">
        <Link href="/login" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
          Sign In
        </Link>
        <Link href="/register" className="px-8 py-3 bg-white text-slate-900 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          Register
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* ── Hero Section ── */}
      <div className="bg-slate-900 text-white pt-12 pb-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Help & Support</h1>
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

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-teal-400' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          
          {/* ── Help Center (Default) ── */}
          {activeTab === "help-center" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                    <FileText size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">Getting Started</h3>
                  <p className="text-slate-500 mb-8 flex-grow font-medium leading-relaxed">Learn the basics of Earner and how to set up your account for success.</p>
                  <Link href="/register" className="text-teal-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Guide <ChevronRight size={16} />
                  </Link>
                </div>
                
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                    <HelpCircle size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">Buying & Selling</h3>
                  <p className="text-slate-500 mb-8 flex-grow font-medium leading-relaxed">Everything you need to know about payments, orders, and delivery.</p>
                  <Link href="/categories" className="text-amber-600 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore Services <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                    <MessageCircle size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">Contact Support</h3>
                  <p className="text-slate-500 mb-8 flex-grow font-medium leading-relaxed">Can't find what you're looking for? Our team is here to help 24/7.</p>
                  <button 
                    onClick={() => setActiveTab("inquiries")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-colors duration-200"
                  >
                    Send Message
                  </button>
                </div>
              </div>

              {/* FAQs Section */}
              <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
                  <p className="text-slate-500 font-medium text-lg">Find quick answers to the most common questions.</p>
                </div>
                
                {publicFaqs.length > 0 ? (
                  <FaqAccordion faqs={publicFaqs} />
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">No general FAQs available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── My Tickets ── */}
          {activeTab === "tickets" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {!user ? renderNotLoggedIn("My Tickets") : <TicketsTab />}
            </div>
          )}

          {/* ── Live Chat ── */}
          {activeTab === "chat" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {!user ? renderNotLoggedIn("Live Chat") : <LiveChatTab />}
            </div>
          )}

          {/* ── My Inquiries ── */}
          {activeTab === "inquiries" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {!user ? renderNotLoggedIn("My Inquiries") : <InquiriesTab />}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

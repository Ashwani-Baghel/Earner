"use client";

import { ChevronDown } from "lucide-react";

export function ContactForm() {
  return (
    <form 
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        alert("Thank you for your message. We will get back to you shortly!");
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
          <input 
            type="text" 
            required
            placeholder="Jane Doe" 
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
          <input 
            type="email" 
            required
            placeholder="jane@example.com" 
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Subject</label>
        <div className="relative">
          <select 
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white appearance-none text-slate-700"
          >
            <option>General Inquiry</option>
            <option>Technical Support</option>
            <option>Billing Question</option>
            <option>Partnership Opportunity</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
        <textarea 
          required
          placeholder="How can we help you today?" 
          rows={6}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white resize-y"
        ></textarea>
      </div>

      <div className="mt-6">
        <button 
          type="submit" 
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
        >
          Send Message
        </button>
      </div>
    </form>
  );
}

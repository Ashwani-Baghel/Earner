"use client";

import { useState, useEffect } from "react";
import { SettingsPageTemplate } from "@/components/admin/settings/SettingsPageTemplate";
import { useCmsSettings } from "@/hooks/useCmsSettings";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, GripVertical } from "lucide-react";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  target: "BUYER" | "SELLER" | "GENERAL" | "BOTH";
};

const DEFAULT_FAQS = {
  items: [
    { id: "1", question: "How do I become a seller?", answer: "Click 'Become a Seller' in the navbar...", target: "GENERAL" },
    { id: "2", question: "How does payment work?", answer: "Funds are held in escrow until...", target: "BUYER" }
  ] as FAQ[]
};

export default function FaqsCMS() {
  const { data, setData, loading, saving, handleSave } = useCmsSettings("faqs", DEFAULT_FAQS);
  
  // Local state for fast UI updates
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    if (data && data.items) {
      setFaqs(data.items);
    }
  }, [data]);

  const addFaq = () => {
    setFaqs([...faqs, { id: Math.random().toString(36).substring(7), question: "", answer: "", target: "GENERAL" }]);
  };

  const removeFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };

  const updateFaq = (id: string, field: keyof FAQ, value: string) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const onSaveWrap = () => {
    setData({ items: faqs });
    setTimeout(handleSave, 50); // Small delay to let React state commit
  };

  return (
    <SettingsPageTemplate 
      title="Global FAQs" 
      loading={loading} 
      saving={saving} 
      onSave={onSaveWrap}
    >
      <div className="mb-6 pb-6 border-b border-slate-100 flex items-center justify-between">
        <p className="text-slate-500 text-sm">Manage the Frequently Asked Questions for the Help Center.</p>
        <button 
          onClick={addFaq}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      <div className="space-y-4">
        {faqs.length === 0 && (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">No FAQs created yet. Click "Add FAQ" to start.</p>
          </div>
        )}

        {faqs.map((faq, index) => (
          <div key={faq.id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm relative group">
            <div className="mt-2 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500">
              <GripVertical size={20} />
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input 
                    value={faq.question} 
                    onChange={(e) => updateFaq(faq.id, "question", e.target.value)} 
                    placeholder="Question (e.g. How do refunds work?)" 
                    className="font-semibold text-slate-800"
                  />
                </div>
                <div className="w-32">
                  <select 
                    value={faq.target}
                    onChange={(e) => updateFaq(faq.id, "target", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-sm font-medium outline-none"
                  >
                    <option value="GENERAL">General / Help Center</option>
                    <option value="BUYER">Buyer Dashboard</option>
                    <option value="SELLER">Seller Dashboard</option>
                    <option value="BOTH">Both Dashboards</option>
                  </select>
                </div>
              </div>
              
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                placeholder="Detailed answer..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm resize-y"
                rows={2}
              />
            </div>

            <button 
              onClick={() => removeFaq(faq.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Delete FAQ"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </SettingsPageTemplate>
  );
}

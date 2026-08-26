"use client";

import { useState } from "react";
import { List, CheckSquare, Plus, GripVertical, Trash2, Edit2, Eye, User, ShoppingBag } from "lucide-react";

interface Category {
  id: string;
  label: string;
  active: boolean;
  target: "buyer" | "seller" | "both";
}

const INITIAL_CATEGORIES: Category[] = [
  { id: "c1", label: "Poor Quality", active: true, target: "both" },
  { id: "c2", label: "Late Delivery", active: true, target: "buyer" },
  { id: "c3", label: "Non Delivery", active: true, target: "buyer" },
  { id: "c4", label: "Requirements Not Met", active: true, target: "buyer" },
  { id: "c5", label: "Incorrect Delivery", active: true, target: "buyer" },
  { id: "c6", label: "Payment Problem", active: true, target: "both" },
  { id: "c7", label: "Copyright Issue", active: true, target: "both" },
  { id: "c8", label: "Buyer Unresponsive", active: true, target: "seller" },
  { id: "c9", label: "Unreasonable Revision Request", active: true, target: "seller" },
  { id: "c10", label: "Requirements Constantly Changing", active: true, target: "seller" },
  { id: "c11", label: "Other", active: true, target: "both" },
];

export default function DisputeCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");

  const toggleCategory = (id: string) => {
    setCategories(categories.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    ));
  };

  const buyerCategories = categories.filter(c => (c.target === "buyer" || c.target === "both") && c.active);
  const sellerCategories = categories.filter(c => (c.target === "seller" || c.target === "both") && c.active);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <List className="text-indigo-600" size={24} />
          Dispute Categories
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Control the reasons users can select when opening a dispute against an order.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Left Column: Management */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckSquare className="text-teal-600" size={20} />
                Manage Categories
              </h2>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">
                <Plus size={16} /> Add Category
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${cat.active ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                  >
                    <button className="text-slate-300 hover:text-slate-500 cursor-grab">
                      <GripVertical size={18} />
                    </button>
                    
                    <label className="relative flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={cat.active}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      <div className="w-5 h-5 bg-white border-2 border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors flex items-center justify-center">
                        {cat.active && <CheckSquare size={14} className="text-white absolute" />}
                      </div>
                    </label>
                    
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${cat.active ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                        {cat.label}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {cat.target === "both" || cat.target === "buyer" ? (
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Buyer</span>
                        ) : null}
                        {cat.target === "both" || cat.target === "seller" ? (
                          <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Seller</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Previews */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Eye className="text-indigo-400" size={20} />
                Live Preview
              </h2>
            </div>
            
            <div className="p-1 bg-slate-800/50 flex m-6 rounded-xl border border-slate-700">
              <button 
                onClick={() => setActiveTab("buyer")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "buyer" ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ShoppingBag size={16} /> Buyer Sees
              </button>
              <button 
                onClick={() => setActiveTab("seller")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "seller" ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <User size={16} /> Seller Sees
              </button>
            </div>

            <div className="p-6 pt-0">
              {/* Fake UI Container simulating the front-end */}
              <div className="bg-white rounded-2xl p-6 shadow-inner relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 rounded-t-2xl"></div>
                <h3 className="text-xl font-black text-slate-900 mb-1">Open a Dispute</h3>
                <p className="text-sm font-bold text-slate-800 mb-4 mt-6">Why are you opening this dispute?</p>
                
                <div className="space-y-3">
                  {(activeTab === "buyer" ? buyerCategories : sellerCategories).map(cat => (
                    <label key={`preview-${cat.id}`} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-indigo-400 flex items-center justify-center transition-colors">
                        {/* fake radio dot */}
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{cat.label}</span>
                    </label>
                  ))}
                  
                  {(activeTab === "buyer" ? buyerCategories : sellerCategories).length === 0 && (
                    <p className="text-sm text-slate-400 italic">No categories enabled for this role.</p>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                  <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg opacity-50 cursor-not-allowed">
                    Continue
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

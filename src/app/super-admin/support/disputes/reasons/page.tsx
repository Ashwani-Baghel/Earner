"use client";

import { useState } from "react";
import { CheckCircle, Plus, GripVertical, Trash2, Edit2, Eye, ShieldCheck, UserCheck, Scale, IndianRupee } from "lucide-react";

interface Reason {
  id: string;
  label: string;
  active: boolean;
}

interface ReasonGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  reasons: Reason[];
}

const INITIAL_GROUPS: ReasonGroup[] = [
  {
    id: "buyer-won",
    title: "Buyer Won",
    icon: <UserCheck size={18} />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    reasons: [
      { id: "bw1", label: "Seller failed to deliver", active: true },
      { id: "bw2", label: "Requirements not met", active: true },
      { id: "bw3", label: "Seller violated policy", active: true },
    ]
  },
  {
    id: "seller-won",
    title: "Seller Won",
    icon: <ShieldCheck size={18} />,
    color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    reasons: [
      { id: "sw1", label: "Work delivered as agreed", active: true },
      { id: "sw2", label: "Buyer changed requirements", active: true },
      { id: "sw3", label: "Buyer violated policy", active: true },
    ]
  },
  {
    id: "partial",
    title: "Partial Resolution",
    icon: <Scale size={18} />,
    color: "text-amber-600 bg-amber-50 border-amber-100",
    reasons: [
      { id: "p1", label: "Partial delivery", active: true },
      { id: "p2", label: "Partial quality issue", active: true },
      { id: "p3", label: "Mutual agreement", active: true },
    ]
  }
];

export default function ResolutionReasonsPage() {
  const [groups, setGroups] = useState<ReasonGroup[]>(INITIAL_GROUPS);
  const [previewOutcome, setPreviewOutcome] = useState<string>("buyer-won");

  const toggleReason = (groupId: string, reasonId: string) => {
    setGroups(groups.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        reasons: g.reasons.map(r => r.id === reasonId ? { ...r, active: !r.active } : r)
      };
    }));
  };

  const activeGroup = groups.find(g => g.id === previewOutcome);
  const activeReasons = activeGroup?.reasons.filter(r => r.active) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <CheckCircle className="text-emerald-600" size={24} />
          Resolution Reasons
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Control the standardized reasons available to Admins when closing a dispute. This ensures clean, consistent dispute data.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Left Column: Management */}
        <div className="xl:col-span-3 space-y-6">
          
          {groups.map((group) => (
            <div key={group.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className={`p-4 border-b flex items-center justify-between ${group.color}`}>
                <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-wider">
                  {group.icon} {group.title}
                </h2>
                <button className="flex items-center gap-1 px-2.5 py-1 bg-white/50 hover:bg-white text-inherit rounded-lg text-xs font-bold transition-colors">
                  <Plus size={14} /> Add Reason
                </button>
              </div>
              
              <div className="p-4 space-y-2">
                {group.reasons.map((reason) => (
                  <div 
                    key={reason.id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${reason.active ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                  >
                    <button className="text-slate-300 hover:text-slate-500 cursor-grab">
                      <GripVertical size={18} />
                    </button>
                    
                    <label className="relative flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={reason.active}
                        onChange={() => toggleReason(group.id, reason.id)}
                      />
                      <div className="w-5 h-5 bg-white border-2 border-slate-300 rounded peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-colors flex items-center justify-center">
                        {reason.active && <CheckCircle size={14} className="text-white absolute" />}
                      </div>
                    </label>
                    
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${reason.active ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                        {reason.label}
                      </p>
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
          ))}

        </div>

        {/* Right Column: Previews */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 sticky top-6">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Eye className="text-emerald-400" size={20} />
                Admin Preview
              </h2>
            </div>

            <div className="p-6 pt-8">
              {/* Fake UI Container simulating the Admin Drawer */}
              <div className="bg-white rounded-2xl shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Final Decision</h3>
                  <p className="text-xl font-black text-slate-900">Resolve Dispute</p>
                </div>

                <div className="p-6 space-y-5">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resolution Outcome</label>
                    <select 
                      value={previewOutcome}
                      onChange={(e) => setPreviewOutcome(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="buyer-won">Buyer Wins</option>
                      <option value="seller-won">Seller Wins</option>
                      <option value="partial">Partial Settlement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason</label>
                    <select 
                      className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="" disabled selected>Select a reason...</option>
                      {activeReasons.map(r => (
                        <option key={`preview-${r.id}`} value={r.id}>{r.label}</option>
                      ))}
                      {activeReasons.length === 0 && (
                        <option value="" disabled>No active reasons for this outcome</option>
                      )}
                    </select>
                  </div>

                  {previewOutcome !== "seller-won" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Refund Amount</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text" 
                          value={previewOutcome === "buyer-won" ? "5,000" : "2,500"}
                          readOnly
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none shadow-inner"
                        />
                      </div>
                    </div>
                  )}

                  <button className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md mt-2">
                    Confirm & Close Dispute
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

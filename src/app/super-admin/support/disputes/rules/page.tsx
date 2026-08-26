"use client";

import { useState } from "react";
import { Scale, Clock, ShieldAlert, CheckCircle, Save, Info } from "lucide-react";

export default function DisputeRulesPage() {
  const [disputeWindow, setDisputeWindow] = useState("7");
  const [sellerResponseTime, setSellerResponseTime] = useState("48");
  const [buyerResponseTime, setBuyerResponseTime] = useState("48");
  const [autoEscalation, setAutoEscalation] = useState(true);
  const [autoClose, setAutoClose] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Scale className="text-indigo-600" size={24} />
          Dispute Rules
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Control how the automated dispute system behaves on your platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="text-teal-600" size={20} />
              Timeframes & Deadlines
            </h2>
            
            <div className="space-y-6">
              
              {/* Dispute Window */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-900">Buyer can open dispute</label>
                  <p className="text-xs text-slate-500 mt-1">The maximum number of days after delivery that a buyer is allowed to file a dispute.</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shadow-sm w-32">
                  <input 
                    type="number" 
                    value={disputeWindow}
                    onChange={(e) => setDisputeWindow(e.target.value)}
                    className="w-full text-sm font-bold text-slate-900 outline-none text-center"
                    min="1"
                    max="90"
                  />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days</span>
                </div>
              </div>

              {/* Seller Response Time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-900">Seller response time</label>
                  <p className="text-xs text-slate-500 mt-1">How long the seller has to respond once a dispute is opened before automated action occurs.</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shadow-sm w-32">
                  <input 
                    type="number" 
                    value={sellerResponseTime}
                    onChange={(e) => setSellerResponseTime(e.target.value)}
                    className="w-full text-sm font-bold text-slate-900 outline-none text-center"
                    min="1"
                    max="168"
                  />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hours</span>
                </div>
              </div>

              {/* Buyer Response Time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-900">Buyer response time</label>
                  <p className="text-xs text-slate-500 mt-1">How long the buyer has to respond to a seller's counter-offer or evidence.</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shadow-sm w-32">
                  <input 
                    type="number" 
                    value={buyerResponseTime}
                    onChange={(e) => setBuyerResponseTime(e.target.value)}
                    className="w-full text-sm font-bold text-slate-900 outline-none text-center"
                    min="1"
                    max="168"
                  />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hours</span>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <ShieldAlert className="text-amber-500" size={20} />
              Automation Policies
            </h2>
            
            <div className="space-y-6">
              
              {/* Auto Escalation */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-900">Auto Escalation</label>
                  <p className="text-xs text-slate-500 mt-1">Automatically escalate a dispute to Admins if the response time limits are breached without resolution.</p>
                </div>
                <button 
                  onClick={() => setAutoEscalation(!autoEscalation)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${autoEscalation ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${autoEscalation ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Auto Close */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-900">Auto Close</label>
                  <p className="text-xs text-slate-500 mt-1">Automatically close the dispute in favor of the responding party if the other party fails to reply.</p>
                </div>
                <button 
                  onClick={() => setAutoClose(!autoClose)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${autoClose ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${autoClose ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving Rules...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Dispute Rules
                </>
              )}
            </button>
          </div>

        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 sticky top-6">
            <h3 className="text-sm font-black text-indigo-900 flex items-center gap-2 mb-4">
              <Info className="text-indigo-600" size={18} />
              How it works
            </h3>
            
            <div className="space-y-4 text-sm text-indigo-800 font-medium">
              <p>
                These settings determine the strict boundaries of the dispute process on your platform.
              </p>
              
              <div className="bg-white/60 p-4 rounded-xl border border-indigo-200/50 space-y-2">
                <p className="font-bold text-indigo-900 mb-1">Example</p>
                <p><strong>You decide:</strong> Buyer can open a dispute within 7 days of delivery.</p>
                <p><strong>You set:</strong> Dispute Window = <span className="bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-900 font-black">7 days</span></p>
              </div>

              <div className="bg-white/60 p-4 rounded-xl border border-indigo-200/50 space-y-2">
                <p className="font-bold text-indigo-900 mb-1">Impact</p>
                <p>If an order is marked as delivered on Jan 1st, the buyer cannot open a dispute after Jan 8th.</p>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

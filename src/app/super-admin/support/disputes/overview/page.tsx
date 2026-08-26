import { Metadata } from "next";
import { Flag, Activity, CheckCircle, Clock, AlertCircle, XCircle, Search, ShieldAlert, DollarSign, ArrowDownRight, ArrowUpRight, Scale, Timer, PieChart, UserCheck, SplitSquareHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Disputes Overview - Super Admin",
};

export default function DisputesOverviewPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Flag className="text-indigo-600" size={24} />
          Disputes Overview
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Monitor all platform disputes, escalation rates, and resolution metrics.</p>
      </div>

      {/* Main Metric - Total */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-indigo-200 font-bold uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
              <Activity size={16} /> Total Lifetime Disputes
            </p>
            <h2 className="text-6xl font-black">1,250</h2>
          </div>
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
            <ShieldAlert size={40} className="text-indigo-100" />
          </div>
        </div>
      </div>

      {/* Grid of other metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Open */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 hover:border-amber-300 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Open</p>
            <p className="text-3xl font-black text-slate-900">120</p>
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
            <Search size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Under Review</p>
            <p className="text-3xl font-black text-slate-900">45</p>
          </div>
        </div>

        {/* Waiting */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 hover:border-purple-300 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Waiting</p>
            <p className="text-3xl font-black text-slate-900">80</p>
          </div>
        </div>

        {/* Escalated */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 hover:border-red-300 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shrink-0">
            <ShieldAlert size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Escalated</p>
            <p className="text-3xl font-black text-slate-900">15</p>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Resolved</p>
            <p className="text-3xl font-black text-slate-900">950</p>
          </div>
        </div>

        {/* Closed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 hover:border-slate-400 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shrink-0">
            <XCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Closed</p>
            <p className="text-3xl font-black text-slate-900">40</p>
          </div>
        </div>

      </div>

      {/* Financial Impact */}
      <div className="pt-4">
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="text-emerald-600" size={20} />
          Financial Impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <ArrowUpRight size={14} /> 12%
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Disputed Amount</p>
            <p className="text-3xl font-black text-slate-900">$142,500</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 text-red-500">Total Refunded Amount</p>
            <p className="text-3xl font-black text-red-600">$84,300</p>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-red-500 h-1.5 w-[59%]"></div>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">59% of disputed funds</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 text-emerald-600">Amount Released to Sellers</p>
            <p className="text-3xl font-black text-emerald-600">$58,200</p>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 w-[41%]"></div>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2">41% of disputed funds</p>
          </div>
        </div>
      </div>

      {/* Resolution Performance */}
      <div className="pt-4">
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <PieChart className="text-purple-600" size={20} />
          Resolution Performance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4">
              <Timer size={24} />
            </div>
            <p className="text-2xl font-black text-slate-900">3.2 Days</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Avg Resolution Time</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl mx-auto flex items-center justify-center mb-4">
              <UserCheck size={24} />
            </div>
            <p className="text-2xl font-black text-slate-900">45%</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Buyer Win Rate</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl mx-auto flex items-center justify-center mb-4">
              <Scale size={24} />
            </div>
            <p className="text-2xl font-black text-slate-900">35%</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Seller Win Rate</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl mx-auto flex items-center justify-center mb-4">
              <SplitSquareHorizontal size={24} />
            </div>
            <p className="text-2xl font-black text-slate-900">20%</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Partial Resolution</p>
          </div>
        </div>
      </div>

    </div>
  );
}

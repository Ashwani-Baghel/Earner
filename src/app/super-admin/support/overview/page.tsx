import { Metadata } from "next";
import { MessageCircle, Clock, FileText, AlertTriangle, Timer, CheckSquare, Users, LifeBuoy } from "lucide-react";

export const metadata: Metadata = {
  title: "Support Overview - Super Admin",
  description: "High-level overview of support performance and metrics.",
};

export default function SupportOverviewPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LifeBuoy className="text-teal-600" size={24} />
          Support Overview
        </h1>
        <p className="text-slate-500 text-sm mt-1">Real-time metrics and health status of the support system.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Open Chats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Open Chats</p>
            <p className="text-3xl font-black text-slate-900 mt-2">12</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
            <MessageCircle size={24} />
          </div>
        </div>

        {/* Waiting Chats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Waiting Chats</p>
            <p className="text-3xl font-black text-slate-900 mt-2">4</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
            <Clock size={24} />
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Open Tickets</p>
            <p className="text-3xl font-black text-slate-900 mt-2">24</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <FileText size={24} />
          </div>
        </div>

        {/* Unresolved Disputes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Unresolved Disputes</p>
            <p className="text-3xl font-black text-slate-900 mt-2">3</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-inner">
            <AlertTriangle size={24} />
          </div>
        </div>

      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Average Response Time */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-inner shrink-0">
            <Timer size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Avg Response Time</p>
            <p className="text-2xl font-black text-slate-900 mt-1">4m 12s</p>
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              ↓ 12% from last week
            </p>
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner shrink-0">
            <CheckSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Avg Resolution Time</p>
            <p className="text-2xl font-black text-slate-900 mt-1">1h 45m</p>
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              ↓ 5% from last week
            </p>
          </div>
        </div>

        {/* Active Agents */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Active Agents</p>
            <p className="text-2xl font-black text-slate-900 mt-1">8 <span className="text-base text-slate-400 font-medium">/ 12</span></p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Currently online
            </p>
          </div>
        </div>

      </div>
      
      {/* Placeholder Chart Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
          <LifeBuoy className="text-slate-300" size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Detailed Analytics Chart</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-sm text-center">
          Support volume and resolution trends will be visualized here in upcoming updates.
        </p>
      </div>
    </div>
  );
}

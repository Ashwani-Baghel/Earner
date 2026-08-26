"use client";

import { BarChart3, Activity, PieChart, TrendingDown, Target, AlertTriangle, ShieldAlert, ShoppingCart, Users, ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export default function DisputeAnalyticsPage() {
  const sellerData = [
    { name: "John", avatar: "https://i.pravatar.cc/150?u=john", orders: 500, disputes: 2, rate: "0.4%" },
    { name: "Amit", avatar: "https://i.pravatar.cc/150?u=amit", orders: 300, disputes: 18, rate: "6.0%", warning: true },
    { name: "Raj", avatar: "https://i.pravatar.cc/150?u=raj", orders: 800, disputes: 4, rate: "0.5%" },
  ];

  const buyerData = [
    { name: "Alex", avatar: "https://i.pravatar.cc/150?u=alex", orders: 45, disputes: 1, rate: "2.2%" },
    { name: "Priya", avatar: "https://i.pravatar.cc/150?u=priya", orders: 120, disputes: 25, rate: "20.8%", warning: true },
    { name: "Emma", avatar: "https://i.pravatar.cc/150?u=emma", orders: 60, disputes: 0, rate: "0%" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="text-indigo-600" size={24} />
          Dispute Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Reporting on dispute outcomes, category breakdowns, and problematic user behavior.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Total Disputes Hero */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden lg:col-span-1 flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
          <div className="relative z-10">
            <p className="text-indigo-200 font-bold uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
              <Activity size={16} /> Total Disputes
            </p>
            <h2 className="text-6xl font-black mb-4">1,250</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/20 backdrop-blur-md">
              <ArrowUpRight size={14} className="text-emerald-400" /> +12% this month
            </div>
          </div>
        </div>

        {/* Resolution Outcomes */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <PieChart className="text-purple-600" size={20} />
            Resolution Outcomes
          </h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Buyer Wins</span>
                <span className="text-2xl font-black text-emerald-600">42%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full w-[42%]"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Seller Wins</span>
                <span className="text-2xl font-black text-indigo-600">38%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full w-[38%]"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Partial</span>
                <span className="text-2xl font-black text-amber-500">20%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-400 h-2 rounded-full w-[20%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Analysis */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Target className="text-rose-500" size={20} />
            Category Analysis
          </h2>
          
          <div className="space-y-5">
            {[
              { label: "Poor Quality", value: 40, color: "bg-rose-500" },
              { label: "Late Delivery", value: 25, color: "bg-orange-500" },
              { label: "Non Delivery", value: 18, color: "bg-amber-500" },
              { label: "Payment", value: 9, color: "bg-blue-500" },
              { label: "Other", value: 8, color: "bg-slate-400" },
            ].map((cat) => (
              <div key={cat.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-slate-700">{cat.label}</span>
                  <span className="text-sm font-black text-slate-900">{cat.value}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className={`${cat.color} h-1.5 rounded-full`} style={{ width: `${cat.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Analysis Tables */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Problematic Sellers */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
            <h2 className="text-sm font-black text-slate-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 uppercase tracking-wider text-indigo-700">
                <ShoppingCart size={16} /> Seller Analysis
              </span>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">By Volume</span>
            </h2>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-bold">Seller</th>
                    <th className="pb-3 font-bold text-center">Orders</th>
                    <th className="pb-3 font-bold text-center">Disputes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sellerData.map((s) => (
                    <tr key={s.name} className={s.warning ? 'bg-red-50/30' : ''}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar src={s.avatar} alt={s.name} size="sm" />
                          <span className="text-sm font-bold text-slate-700">{s.name}</span>
                          {s.warning && <AlertTriangle size={14} className="text-red-500 ml-1" />}
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-sm font-medium text-slate-600">{s.orders}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-sm font-black ${s.warning ? 'text-red-600' : 'text-slate-900'}`}>{s.disputes}</span>
                        {s.warning && <p className="text-[10px] font-bold text-red-500 mt-0.5">{s.rate} Rate</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Problematic Buyers */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
            <h2 className="text-sm font-black text-slate-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 uppercase tracking-wider text-emerald-700">
                <Users size={16} /> Buyer Analysis
              </span>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">By Volume</span>
            </h2>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-bold">Buyer</th>
                    <th className="pb-3 font-bold text-center">Orders</th>
                    <th className="pb-3 font-bold text-center">Disputes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {buyerData.map((b) => (
                    <tr key={b.name} className={b.warning ? 'bg-red-50/30' : ''}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar src={b.avatar} alt={b.name} size="sm" />
                          <span className="text-sm font-bold text-slate-700">{b.name}</span>
                          {b.warning && <AlertTriangle size={14} className="text-red-500 ml-1" />}
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-sm font-medium text-slate-600">{b.orders}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-sm font-black ${b.warning ? 'text-red-600' : 'text-slate-900'}`}>{b.disputes}</span>
                        {b.warning && <p className="text-[10px] font-bold text-red-500 mt-0.5">{b.rate} Rate</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

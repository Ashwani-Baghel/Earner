"use client";

import { BarChart3, Users, Clock, Ticket, MessageCircle, AlertTriangle, TrendingUp, Star, CheckCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function SupportAnalyticsPage() {
  
  // Mock data for charts
  const volumeData = [
    { name: 'Mon', chats: 400, tickets: 240 },
    { name: 'Tue', chats: 300, tickets: 139 },
    { name: 'Wed', chats: 550, tickets: 380 },
    { name: 'Thu', chats: 278, tickets: 390 },
    { name: 'Fri', chats: 189, tickets: 480 },
    { name: 'Sat', chats: 239, tickets: 380 },
    { name: 'Sun', chats: 349, tickets: 430 },
  ];

  const agentData = [
    { name: 'Sarah (Payment)', resolved: 145, avgRating: 4.8 },
    { name: 'John (General)', resolved: 210, avgRating: 4.5 },
    { name: 'Mike (Disputes)', resolved: 85, avgRating: 4.2 },
    { name: 'Emma (General)', resolved: 180, avgRating: 4.9 },
    { name: 'Alex (Tech)', resolved: 120, avgRating: 4.7 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="text-indigo-600" size={24} />
          Support Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Comprehensive reporting on support volume, response times, and agent performance.
        </p>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Chats */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <MessageCircle size={80} className="text-indigo-600 -translate-y-4 translate-x-4" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Chats</p>
          <h3 className="text-4xl font-black text-slate-900 mb-2">4,250</h3>
          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp size={14} /> +12% vs last week
          </p>
        </div>

        {/* Tickets */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Ticket size={80} className="text-blue-600 -translate-y-4 translate-x-4" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Tickets</p>
          <h3 className="text-4xl font-black text-slate-900 mb-2">1,840</h3>
          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp size={14} /> +5% vs last week
          </p>
        </div>

        {/* Response Time */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock size={80} className="text-amber-500 -translate-y-4 translate-x-4" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Avg Response Time</p>
          <h3 className="text-4xl font-black text-slate-900 mb-2">2m 14s</h3>
          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp size={14} /> -30s vs last week
          </p>
        </div>

        {/* Resolution Time */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle size={80} className="text-emerald-500 -translate-y-4 translate-x-4" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Avg Resolution Time</p>
          <h3 className="text-4xl font-black text-slate-900 mb-2">4h 20m</h3>
          <p className="text-xs font-bold text-red-500 flex items-center gap-1">
            <TrendingUp size={14} className="rotate-180" /> +45m vs last week
          </p>
        </div>

      </div>

      {/* Second Row: Additional KPIs & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Satisfaction */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl shadow-lg relative overflow-hidden text-white h-[calc(50%-12px)]">
            <div className="absolute -top-10 -right-10 opacity-20">
              <Star size={120} className="text-yellow-400" />
            </div>
            <p className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-2">Customer Satisfaction</p>
            <div className="flex items-end gap-3 mt-4">
              <h3 className="text-5xl font-black">4.8</h3>
              <p className="text-lg font-bold text-indigo-300 mb-1">/ 5.0</p>
            </div>
            <div className="mt-4 flex gap-1 text-yellow-400">
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" className="opacity-50" />
            </div>
          </div>

          {/* Escalations */}
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl shadow-sm h-[calc(50%-12px)]">
            <p className="text-sm font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> Total Escalations
            </p>
            <h3 className="text-5xl font-black text-rose-900 mt-4">84</h3>
            <p className="text-sm font-bold text-rose-600 mt-2">
              Requiring Super Admin intervention
            </p>
          </div>
        </div>

        {/* Volume Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-black text-slate-900 mb-6">Support Volume Trend (7 Days)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="chats" name="Live Chats" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorChats)" />
                <Area type="monotone" dataKey="tickets" name="Tickets" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Third Row: Agent Performance */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="text-teal-600" size={20} />
              Agent Performance
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Resolution volume compared across your active support staff.
            </p>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 'bold' }} dx={-10} />
              <RechartsTooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="resolved" name="Cases Resolved" fill="#10b981" radius={[0, 6, 6, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

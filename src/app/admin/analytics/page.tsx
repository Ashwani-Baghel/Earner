"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw, TrendingUp, DollarSign, Users, ShoppingBag } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface AnalyticsData {
  totalRevenue: number;
  daily: { date: string; revenue: number; orders: number }[];
  userGrowth: { date: string; count: number }[];
  topSellers: {
    id: string; name: string; email: string;
    earnings: number; totalOrders: number; rating: number; level: string;
  }[];
  gigStatusCounts: { status: string; count: number }[];
  orderStatusCounts: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#0d9488", PENDING: "#f59e0b", REJECTED: "#ef4444",
  BANNED: "#dc2626", COMPLETED: "#10b981", CANCELLED: "#94a3b8",
  REFUNDED: "#8b5cf6", DELIVERED: "#6366f1",
};

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: any; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]); // eslint-disable-line

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <RefreshCw size={28} className="animate-spin text-teal-600" />
      </div>
    );
  }

  const totalOrders = data.orderStatusCounts.reduce((a, b) => a + b.count, 0);
  const totalUsers  = data.userGrowth.reduce((a, b) => a + b.count, 0);

  // Format date labels for X axis
  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Platform Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Last 30 days overview</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-xl hover:bg-slate-100">
          <RefreshCw size={16} className="text-slate-500" />
        </button>
      </div>

      <div className="p-6 space-y-6">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={`₹${Math.round(data.totalRevenue * 83.5).toLocaleString("en-IN")}`} icon={DollarSign} color="bg-teal-50 text-teal-600" />
          <StatCard label="Total Orders"  value={totalOrders}    icon={ShoppingBag} color="bg-blue-50 text-blue-600"   />
          <StatCard label="New Users (30d)" value={totalUsers}   icon={Users}       color="bg-purple-50 text-purple-600" />
          <StatCard label="Revenue Growth" value={`+${data.daily.filter(d => d.revenue > 0).length}d`} icon={TrendingUp} color="bg-amber-50 text-amber-600" />
        </div>

        {/* ── Revenue Chart ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Revenue (Last 30 Days)</h2>
          <p className="text-xs text-slate-400 mb-4">Completed order revenue per day</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.daily}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Orders + User Growth ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-1">Daily Orders</h2>
            <p className="text-xs text-slate-400 mb-4">Orders created per day</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-1">User Growth</h2>
            <p className="text-xs text-slate-400 mb-4">New signups per day</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Gig Status Pie + Top Sellers ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Gig Status Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.gigStatusCounts}
                  dataKey="count"
                  nameKey="status"
                  cx="50%" cy="50%"
                  outerRadius={80}
                  label={(props) => `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {data.gigStatusCounts.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] ?? "#cbd5e1"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Top Sellers</h2>
            {data.topSellers.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No seller data yet</p>
            ) : (
              <div className="space-y-3">
                {data.topSellers.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{s.name}</p>
                      <p className="text-xs text-slate-400 truncate">{s.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-teal-700">${s.earnings.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">{s.totalOrders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
